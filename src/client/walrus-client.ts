import type {
  ClientOptions,
  StoreOptions,
  ReadOptions,
  StoreResponse,
  BlobMetadata,
  EncryptionOptions,
} from '../types';
import {
  DEFAULT_TESTNET_AGGREGATORS,
  DEFAULT_TESTNET_PUBLISHERS,
  DEFAULT_CONFIG,
} from '../utils/constants';
import {
  normalizeBlobResponse,
  sleep,
  parseErrorResponse,
  combineURLs,
} from '../utils/helpers';
import { createCipher } from '../encryption';
import type { CipherOptions } from '../encryption';
import { CipherSuite, createWalrusError } from '../types';

/**
 * Creates a client for interacting with the Walrus API
 * @param options Configuration options
 * @returns Walrus client with methods for storing and retrieving data
 */
export function createWalrusClient(options: ClientOptions = {}) {
  // Initialize configuration with defaults
  const aggregatorURLs = options.aggregatorURLs || DEFAULT_TESTNET_AGGREGATORS;
  const publisherURLs = options.publisherURLs || DEFAULT_TESTNET_PUBLISHERS;
  const maxRetries = options.maxRetries || DEFAULT_CONFIG.MAX_RETRIES;
  const retryDelay = options.retryDelay || DEFAULT_CONFIG.RETRY_DELAY;
  const maxUnknownLengthUploadSize = options.maxUnknownLengthUploadSize ||
    DEFAULT_CONFIG.MAX_UNKNOWN_LENGTH_UPLOAD_SIZE;
  const fetchImpl = options.fetch || fetch;

  /**
   * Converts EncryptionOptions to CipherOptions
   */
  const toCipherOptions = (encOptions: EncryptionOptions): CipherOptions => {
    return {
      key: encOptions.key,
      suite: encOptions.suite || CipherSuite.AES256GCM,
      iv: encOptions.iv,
    };
  };

  /**
   * Performs an HTTP request with retry logic
   */
  const doWithRetry = async (
    url: string,
    init: RequestInit,
    baseURLs: string[]
  ): Promise<Response> => {
    // Calculate total attempts based on retry config and URL count
    const totalAttempts = maxRetries + 1;
    let lastError: Error | null = null;

    // Try URLs in round-robin fashion until max retries reached
    for (let attempt = 0; attempt < totalAttempts; attempt++) {
      // Get URL index for this attempt
      const urlIndex = attempt % baseURLs.length;
      const baseURL = baseURLs[urlIndex];
      // Ensure baseURL is not undefined
      if (!baseURL) {
        lastError = new Error('No valid base URLs provided');
        continue;
      }

      const fullURL = combineURLs(baseURL, url);

      try {
        // Clone the init object to avoid issues with body already being used
        const requestInit = { ...init };
        if (init.body && init.body instanceof Uint8Array) {
          requestInit.body = init.body.slice(0);
        }

        // Make the request
        const response = await fetchImpl(fullURL, requestInit);

        // Check for success (2xx status code)
        if (response.ok) {
          return response;
        }

        // Handle error response
        const errorMessage = await parseErrorResponse(response);
        lastError = new Error(
          `Request failed with status code ${response.status}: ${errorMessage}`
        );
      } catch (error) {
        // Handle network or other errors
        lastError = error instanceof Error
          ? error
          : new Error('Unknown error occurred');
      }

      // Sleep before next attempt if not the last attempt
      if (attempt < totalAttempts - 1) {
        await sleep(retryDelay);
      }
    }

    // All retries failed
    throw new Error(`All retry attempts failed: ${lastError?.message || 'Unknown error'}`);
  };

  /**
   * Stores data on the Walrus Publisher
   * @param data Data to store
   * @param options Storage options
   * @returns Response with blob information
   */
  const store = async (data: Uint8Array, options: StoreOptions = {}): Promise<StoreResponse> => {
    let body = data;

    // Handle encryption if enabled
    if (options.encryption) {
      const cipherOptions = toCipherOptions(options.encryption);
      const cipher = createCipher(cipherOptions);
      body = await cipher.encrypt(data);
    }

    // Create URL with epoch parameter if specified
    let url = '/v1/blobs';
    if (options.epochs && options.epochs > 0) {
      url += `?epochs=${options.epochs}`;
    }

    // Create request
    const init: RequestInit = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body,
    };

    // Send request with retry logic
    const response = await doWithRetry(url, init, publisherURLs);

    // Parse and normalize response
    const responseData = await response.json() as StoreResponse;
    return normalizeBlobResponse(responseData);
  };

  /**
   * Stores data from a readable stream
   * @param stream Readable stream containing data to store
   * @param options Storage options
   * @returns Response with blob information
   */
  const storeFromStream = async (
    stream: ReadableStream<Uint8Array>,
    options: StoreOptions = {}
  ): Promise<StoreResponse> => {
    // Read all data from the stream first
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();
    let totalLength = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        totalLength += value.byteLength;

        // Check size limit to prevent memory issues
        if (totalLength > maxUnknownLengthUploadSize) {
          throw new Error(
            `Stream size exceeds maximum allowed (${maxUnknownLengthUploadSize} bytes). ` +
            `Use a file or buffer with known size instead.`
          );
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Combine chunks into a single Uint8Array
    const data = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.byteLength;
    }

    // Store the combined data
    return store(data, options);
  };

  /**
   * Downloads and stores content from a URL
   * @param url URL to download content from
   * @param options Storage options
   * @returns Response with blob information
   */
  const storeFromURL = async (url: string, options: StoreOptions = {}): Promise<StoreResponse> => {
    // Download content from URL
    const response = await fetchImpl(url);

    if (!response.ok) {
      throw new Error(`Failed to download from URL ${url}: HTTP status ${response.status}`);
    }

    // Get content as array buffer and create a properly typed Uint8Array
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(new Uint8Array(arrayBuffer));

    // Store the downloaded content
    return store(data, options);
  };

  /**
   * Stores a file on the Walrus Publisher
   * @param filePath Path to the file
   * @param options Storage options
   * @returns Response with blob information
   */
  const storeFile = async (filePath: string, options: StoreOptions = {}): Promise<StoreResponse> => {
    // Read file content directly into a binary buffer
    const file = Bun.file(filePath);
    const fileData = await file.arrayBuffer();

    // Create a new Uint8Array with explicit typing to avoid ArrayBufferLike issues
    const data = new Uint8Array(new Uint8Array(fileData));

    // Store the file content
    return store(data, options);
  };

  /**
   * Retrieves data from the Walrus Aggregator
   * @param blobId Blob ID to retrieve
   * @param options Read options
   * @returns Retrieved data
   */
  const read = async (blobId: string, options: ReadOptions = {}): Promise<Uint8Array> => {
    // Create URL with blob ID
    const url = `/v1/blobs/${encodeURIComponent(blobId)}`;

    // Create request
    const init: RequestInit = {
      method: 'GET',
    };

    // Send request with retry logic
    const response = await doWithRetry(url, init, aggregatorURLs);

    // Get response as array buffer and create a properly typed Uint8Array
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(new Uint8Array(arrayBuffer));

    // Handle decryption if enabled
    if (options.encryption) {
      const cipherOptions = toCipherOptions(options.encryption);
      const cipher = createCipher(cipherOptions);
      const decryptedData = await cipher.decrypt(data);

      // Create a new Uint8Array to ensure correct typing
      const result = new Uint8Array(decryptedData.byteLength);
      result.set(decryptedData);
      return result;
    }

    return data;
  };

  /**
   * Retrieves data and saves it to a file
   * @param blobId Blob ID to retrieve
   * @param filePath Path to save the file to
   * @param options Read options
   */
  const readToFile = async (blobId: string, filePath: string, options: ReadOptions = {}): Promise<void> => {
    // Read blob data
    const data = await read(blobId, options);

    // Write data to file
    await Bun.write(filePath, data);
  };

  /**
   * Retrieves a readable stream for a blob
   * @param blobId Blob ID to retrieve
   * @param options Read options
   * @returns Readable stream of blob data
   */
  const readToStream = async (blobId: string, options: ReadOptions = {}): Promise<ReadableStream<Uint8Array>> => {
    // If encryption is enabled, we need to read the entire blob and decrypt it first
    if (options.encryption) {
      const data = await read(blobId, options);

      // Convert the decrypted data to a stream
      return new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(data);
          controller.close();
        }
      });
    }

    // Without encryption, we can stream directly from the API
    const url = `/v1/blobs/${encodeURIComponent(blobId)}`;
    const init: RequestInit = { method: 'GET' };

    const response = await doWithRetry(url, init, aggregatorURLs);
    // Ensure body is not null before returning
    if (!response.body) {
      throw new Error('Response body is null or undefined');
    }
    return response.body;
  };

  /**
   * Retrieves blob metadata without downloading the content
   * @param blobId Blob ID to get metadata for
   * @returns Blob metadata
   */
  const head = async (blobId: string): Promise<BlobMetadata> => {
    // Create URL with blob ID
    const url = `/v1/blobs/${encodeURIComponent(blobId)}`;

    // Create request
    const init: RequestInit = {
      method: 'HEAD',
    };

    // Send request with retry logic
    const response = await doWithRetry(url, init, aggregatorURLs);

    // Extract metadata from response headers
    return {
      contentLength: parseInt(response.headers.get('content-length') || '0', 10),
      contentType: response.headers.get('content-type') || '',
      lastModified: response.headers.get('last-modified') || '',
      etag: response.headers.get('etag') || '',
    };
  };

  /**
   * Retrieves the API specification from the aggregator or publisher
   * @param isAggregator Whether to get the aggregator's API spec (true) or the publisher's (false)
   * @returns API specification data
   */
  const getAPISpec = async (isAggregator: boolean): Promise<Uint8Array> => {
    // Create URL
    const url = '/v1/api';

    // Create request
    const init: RequestInit = {
      method: 'GET',
    };

    // Send request with retry logic
    const response = await doWithRetry(
      url,
      init,
      isAggregator ? aggregatorURLs : publisherURLs
    );

    // Get response as array buffer and create a properly typed Uint8Array
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(new Uint8Array(arrayBuffer));
  };

  // Return the client interface
  return {
    store,
    storeFromStream,
    storeFromURL,
    storeFile,
    read,
    readToFile,
    readToStream,
    head,
    getAPISpec
  };
}

// For backward compatibility and types
export type WalrusClient = ReturnType<typeof createWalrusClient>; 