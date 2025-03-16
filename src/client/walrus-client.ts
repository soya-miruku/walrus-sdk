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
  getContentTypeFromFilename,
} from '../utils/helpers';
import { createCipher } from '../encryption';
import type { CipherOptions } from '../encryption';
import { CipherSuite, createWalrusError } from '../types';
import logger, { configureLogger } from '../utils/logger';

/**
 * Creates a client for interacting with the Walrus API
 * @param options Configuration options
 * @returns Walrus client with methods for storing and retrieving data
 */
export function createWalrusClient(options: ClientOptions = {}) {
  // Configure logger if options provided
  if (options.logger) {
    configureLogger(options.logger);
  }

  // Initialize configuration with defaults
  const aggregatorURLs = options.aggregatorURLs || DEFAULT_TESTNET_AGGREGATORS;
  const publisherURLs = options.publisherURLs || DEFAULT_TESTNET_PUBLISHERS;
  const maxRetries = options.maxRetries || DEFAULT_CONFIG.MAX_RETRIES;
  const retryDelay = options.retryDelay || DEFAULT_CONFIG.RETRY_DELAY;
  const maxUnknownLengthUploadSize = options.maxUnknownLengthUploadSize ||
    DEFAULT_CONFIG.MAX_UNKNOWN_LENGTH_UPLOAD_SIZE;
  const fetchImpl = options.fetch || fetch;

  logger.info('Creating Walrus client', {
    aggregatorCount: aggregatorURLs.length,
    publisherCount: publisherURLs.length,
    maxRetries,
    retryDelay
  });

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
    return logger.timeAsync('doWithRetry', async () => {
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
          logger.warn('No valid base URL found', { attempt, urlIndex });
          continue;
        }

        const fullURL = combineURLs(baseURL, url);
        logger.debug('Attempting request', {
          attempt: attempt + 1,
          totalAttempts,
          url: fullURL,
          method: init.method
        });

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
            logger.debug('Request successful', {
              statusCode: response.status,
              url: fullURL
            });
            return response;
          }

          // Handle error response
          const errorMessage = await parseErrorResponse(response);
          lastError = new Error(
            `Request failed with status code ${response.status}: ${errorMessage}`
          );
          logger.warn('Request failed', {
            statusCode: response.status,
            message: errorMessage,
            url: fullURL,
            attempt: attempt + 1
          });
        } catch (error) {
          // Handle network or other errors
          lastError = error instanceof Error
            ? error
            : new Error('Unknown error occurred');

          logger.warn('Network error', {
            error: lastError.message,
            url: fullURL,
            attempt: attempt + 1
          });
        }

        // Sleep before next attempt if not the last attempt
        if (attempt < totalAttempts - 1) {
          logger.debug('Retrying after delay', { delayMs: retryDelay });
          await sleep(retryDelay);
        }
      }

      // All retries failed
      logger.error('All retry attempts failed', { error: lastError?.message || 'Unknown error' });
      throw new Error(`All retry attempts failed: ${lastError?.message || 'Unknown error'}`);
    }, { url, method: init.method });
  };

  /**
   * Stores data on the Walrus Publisher
   * @param data Data to store
   * @param options Storage options
   * @returns Response with blob information
   */
  const store = async (data: Uint8Array, options: StoreOptions = {}): Promise<StoreResponse> => {
    return logger.timeAsync('store', async () => {
      let body = data;
      logger.info('Storing data', {
        size: data.byteLength,
        epochs: options.epochs,
        contentType: options.contentType,
        hasEncryption: !!options.encryption
      });

      // Handle encryption if enabled
      if (options.encryption) {
        const cipherOptions = toCipherOptions(options.encryption);
        const cipher = createCipher(cipherOptions);
        logger.debug('Encrypting data', { suite: cipherOptions.suite });
        body = await logger.timeAsync('encrypt', () => cipher.encrypt(data));
        logger.debug('Data encrypted', { originalSize: data.byteLength, encryptedSize: body.byteLength });
      }

      // Create URL with epoch parameter if specified
      let url = '/v1/blobs';
      if (options.epochs && options.epochs > 0) {
        url += `?epochs=${options.epochs}`;
      }

      // Set up headers with content type if specified
      const headers: Record<string, string> = {
        'Content-Type': options.contentType || 'application/octet-stream',
      };

      // Create request
      const init: RequestInit = {
        method: 'PUT',
        headers,
        body,
      };

      // Send request with retry logic
      const response = await doWithRetry(url, init, publisherURLs);

      // Parse and normalize response
      const responseData = await response.json() as StoreResponse;
      const normalizedResponse = normalizeBlobResponse(responseData);
      logger.info('Data stored successfully', {
        blobId: normalizedResponse.blob.blobId,
        endEpoch: normalizedResponse.blob.endEpoch,
        isNewlyCreated: !!normalizedResponse.newlyCreated
      });

      return normalizedResponse;
    }, { dataSize: data.byteLength });
  };

  /**
   * Stores JSON data on the Walrus Publisher
   * @param data JSON-serializable data to store
   * @param options Storage options
   * @returns Response with blob information
   */
  const storeJSON = async (data: unknown, options: StoreOptions = {}): Promise<StoreResponse> => {
    return logger.timeAsync('storeJSON', async () => {
      try {
        // Convert JSON to string
        const jsonString = JSON.stringify(data);
        logger.debug('JSON serialized', { stringLength: jsonString.length });

        // Convert string to Uint8Array using TextEncoder
        const encoder = new TextEncoder();
        const uint8Data = encoder.encode(jsonString);

        // Use existing store method with content type set to application/json
        const requestOptions: StoreOptions = {
          ...options,
          contentType: 'application/json'
        };

        return await store(uint8Data, requestOptions);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to store JSON data', { error: error.message });
          throw createWalrusError(`Failed to store JSON data: ${error.message}`, { cause: error });
        }
        logger.error('Failed to store JSON data with unknown error');
        throw createWalrusError('Failed to store JSON data: unknown error');
      }
    });
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
    return logger.timeAsync('storeFromStream', async () => {
      logger.info('Storing data from stream');

      // Read all data from the stream first
      const chunks: Uint8Array[] = [];
      const reader = stream.getReader();
      let totalLength = 0;

      logger.debug('Reading stream chunks');
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          totalLength += value.byteLength;
          logger.debug('Read stream chunk', { chunkSize: value.byteLength, totalLength });

          // Check size limit to prevent memory issues
          if (totalLength > maxUnknownLengthUploadSize) {
            logger.error('Stream size exceeded maximum allowed', {
              totalLength,
              maxSize: maxUnknownLengthUploadSize
            });
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
      logger.debug('Combining stream chunks', { chunkCount: chunks.length, totalLength });
      const data = new Uint8Array(totalLength);
      let offset = 0;

      for (const chunk of chunks) {
        data.set(chunk, offset);
        offset += chunk.byteLength;
      }

      // Store the combined data
      logger.info('Stream fully read, storing data', { size: data.byteLength });
      return store(data, options);
    });
  };

  /**
   * Downloads and stores content from a URL
   * @param url URL to download content from
   * @param options Storage options
   * @returns Response with blob information
   */
  const storeFromURL = async (url: string, options: StoreOptions = {}): Promise<StoreResponse> => {
    return logger.timeAsync('storeFromURL', async () => {
      logger.info('Downloading and storing content from URL', { url });

      // Download content from URL
      logger.debug('Fetching URL content', { url });
      const response = await fetchImpl(url);

      if (!response.ok) {
        logger.error('Failed to download from URL', { url, statusCode: response.status });
        throw new Error(`Failed to download from URL ${url}: HTTP status ${response.status}`);
      }

      // Get content as array buffer and create a properly typed Uint8Array
      const arrayBuffer = await response.arrayBuffer();
      const data = new Uint8Array(new Uint8Array(arrayBuffer));
      logger.debug('URL content downloaded', { size: data.byteLength });

      // Store the downloaded content
      return store(data, options);
    }, { url });
  };

  /**
   * Stores a file on the Walrus Publisher
   * @param filePath Path to the file
   * @param options Storage options
   * @returns Response with blob information
   */
  const storeFile = async (filePath: string, options: StoreOptions = {}): Promise<StoreResponse> => {
    return logger.timeAsync('storeFile', async () => {
      logger.info('Storing file', { filePath });

      // Read file content directly into a binary buffer
      const file = Bun.file(filePath);
      logger.debug('Reading file', { filePath, size: file.size });
      const fileData = await file.arrayBuffer();

      // Create a new Uint8Array with explicit typing to avoid ArrayBufferLike issues
      const data = new Uint8Array(new Uint8Array(fileData));
      logger.debug('File read successfully', { size: data.byteLength });

      // Auto-detect content type from filename if not explicitly provided
      const detectedContentType = getContentTypeFromFilename(filePath);
      const requestOptions: StoreOptions = {
        ...options,
        contentType: options.contentType || detectedContentType
      };

      logger.debug('Detected content type', {
        filePath,
        contentType: requestOptions.contentType
      });

      // Store the file content
      return store(data, requestOptions);
    }, { filePath });
  };

  /**
   * Retrieves data from the Walrus Aggregator
   * @param blobId Blob ID to retrieve
   * @param options Read options
   * @returns Retrieved data
   */
  const read = async (blobId: string, options: ReadOptions = {}): Promise<Uint8Array> => {
    return logger.timeAsync('read', async () => {
      logger.info('Reading blob', { blobId, hasDecryption: !!options.encryption });

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
      logger.debug('Blob data retrieved', { size: data.byteLength, blobId });

      // Handle decryption if enabled
      if (options.encryption) {
        const cipherOptions = toCipherOptions(options.encryption);
        const cipher = createCipher(cipherOptions);
        logger.debug('Decrypting data', { suite: cipherOptions.suite });

        const decryptedData = await logger.timeAsync('decrypt', () => cipher.decrypt(data));

        // Create a new Uint8Array to ensure correct typing
        const result = new Uint8Array(decryptedData.byteLength);
        result.set(decryptedData);

        logger.debug('Data decrypted', {
          originalSize: data.byteLength,
          decryptedSize: result.byteLength
        });

        return result;
      }

      return data;
    }, { blobId });
  };

  /**
   * Retrieves JSON data from the Walrus Aggregator
   * @param blobId Blob ID to retrieve
   * @param options Read options
   * @returns Retrieved and parsed JSON data
   */
  const readJSON = async <T = unknown>(blobId: string, options: ReadOptions = {}): Promise<T> => {
    return logger.timeAsync('readJSON', async () => {
      try {
        logger.info('Reading and parsing JSON blob', { blobId });

        // Read the binary data
        const data = await read(blobId, options);

        // Convert binary data to string
        const decoder = new TextDecoder();
        const jsonString = decoder.decode(data);
        logger.debug('JSON string decoded', { stringLength: jsonString.length });

        // Parse the JSON string
        const result = JSON.parse(jsonString) as T;
        logger.debug('JSON parsed successfully', { blobId });

        return result;
      } catch (error) {
        if (error instanceof Error) {
          logger.error('Failed to read JSON data', { error: error.message, blobId });
          throw createWalrusError(`Failed to read JSON data: ${error.message}`, { cause: error });
        }
        logger.error('Failed to read JSON data with unknown error', { blobId });
        throw createWalrusError('Failed to read JSON data: unknown error');
      }
    }, { blobId });
  };

  /**
   * Retrieves data and saves it to a file
   * @param blobId Blob ID to retrieve
   * @param filePath Path to save the file to
   * @param options Read options
   */
  const readToFile = async (blobId: string, filePath: string, options: ReadOptions = {}): Promise<void> => {
    return logger.timeAsync('readToFile', async () => {
      logger.info('Reading blob and saving to file', { blobId, filePath });

      // Read blob data
      const data = await read(blobId, options);
      logger.debug('Writing data to file', { filePath, size: data.byteLength });

      // Write data to file
      await Bun.write(filePath, data);
      logger.info('File saved successfully', { filePath, size: data.byteLength });
    }, { blobId, filePath });
  };

  /**
   * Retrieves a readable stream for a blob
   * @param blobId Blob ID to retrieve
   * @param options Read options
   * @returns Readable stream of blob data
   */
  const readToStream = async (blobId: string, options: ReadOptions = {}): Promise<ReadableStream<Uint8Array>> => {
    return logger.timeAsync('readToStream', async () => {
      logger.info('Reading blob to stream', { blobId, hasDecryption: !!options.encryption });

      // If encryption is enabled, we need to read the entire blob and decrypt it first
      if (options.encryption) {
        logger.debug('Encryption enabled, reading entire blob for decryption');
        const data = await read(blobId, options);

        // Convert the decrypted data to a stream
        logger.debug('Creating stream from decrypted data', { size: data.byteLength });
        return new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(data);
            controller.close();
          }
        });
      }

      // Without encryption, we can stream directly from the API
      logger.debug('Creating direct stream from API', { blobId });
      const url = `/v1/blobs/${encodeURIComponent(blobId)}`;
      const init: RequestInit = { method: 'GET' };

      const response = await doWithRetry(url, init, aggregatorURLs);
      // Ensure body is not null before returning
      if (!response.body) {
        logger.error('Response body is null or undefined', { blobId });
        throw new Error('Response body is null or undefined');
      }

      logger.debug('Stream created successfully', { blobId });
      return response.body;
    }, { blobId });
  };

  /**
   * Retrieves blob metadata without downloading the content
   * @param blobId Blob ID to get metadata for
   * @returns Blob metadata
   */
  const head = async (blobId: string): Promise<BlobMetadata> => {
    return logger.timeAsync('head', async () => {
      logger.info('Retrieving blob metadata', { blobId });

      // Create URL with blob ID
      const url = `/v1/blobs/${encodeURIComponent(blobId)}`;

      // Create request
      const init: RequestInit = {
        method: 'HEAD',
      };

      // Send request with retry logic
      const response = await doWithRetry(url, init, aggregatorURLs);

      // Extract metadata from response headers
      const metadata = {
        contentLength: parseInt(response.headers.get('content-length') || '0', 10),
        contentType: response.headers.get('content-type') || '',
        lastModified: response.headers.get('last-modified') || '',
        etag: response.headers.get('etag') || '',
      };

      logger.debug('Blob metadata retrieved', metadata);
      return metadata;
    }, { blobId });
  };

  /**
   * Retrieves the API specification from the aggregator or publisher
   * @param isAggregator Whether to get the aggregator's API spec (true) or the publisher's (false)
   * @returns API specification data
   */
  const getAPISpec = async (isAggregator: boolean): Promise<Uint8Array> => {
    return logger.timeAsync('getAPISpec', async () => {
      const source = isAggregator ? 'aggregator' : 'publisher';
      logger.info(`Retrieving API specification from ${source}`);

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
      const data = new Uint8Array(new Uint8Array(arrayBuffer));

      logger.debug('API specification retrieved', {
        source,
        size: data.byteLength
      });

      return data;
    }, { source: isAggregator ? 'aggregator' : 'publisher' });
  };

  // Return the client interface
  return {
    store,
    storeJSON,
    storeFromStream,
    storeFromURL,
    storeFile,
    read,
    readJSON,
    readToFile,
    readToStream,
    head,
    getAPISpec
  };
}

// For backward compatibility and types
export type WalrusClient = ReturnType<typeof createWalrusClient>; 