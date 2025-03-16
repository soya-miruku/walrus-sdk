This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: **/*.md, **/*.mdc, **/*.txt
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded

## Additional Info

# Directory Structure
```
examples/
  basic-storage.ts
  custom-client.ts
  encrypted-storage.ts
  error-handling.ts
  file-operations.ts
  json-operations.ts
  url-operations.ts
src/
  client/
    walrus-client.ts
  encryption/
    cbc.ts
    gcm.ts
    index.ts
    interfaces.ts
  tests/
    encryption.test.ts
  types/
    index.ts
  utils/
    constants.ts
    helpers.ts
  index.ts
.gitignore
biome.json
bun.lock
LICENSE
package.json
tsconfig.json
```

# Files

## File: examples/basic-storage.ts
```typescript
/**
 * Basic Storage Example
 * 
 * This example demonstrates how to store and retrieve data using the Walrus SDK.
 */

import { createWalrusClient } from '../src';

async function main() {
  // Initialize client with default testnet endpoints
  const client = createWalrusClient();

  // Create some data to store
  const data = new TextEncoder().encode('Hello, Walrus Protocol!');

  console.log('Storing data to Walrus...');

  try {
    // Store the data for 10 epochs
    const storeResponse = await client.store(data, { epochs: 10 });

    console.log(`Data stored with blob ID: ${storeResponse.blob.blobId}`);
    console.log(`Will be available until epoch: ${storeResponse.blob.endEpoch}`);

    // Get metadata about the stored blob
    const metadata = await client.head(storeResponse.blob.blobId);
    console.log(`Content size: ${metadata.contentLength} bytes`);
    console.log(`Content type: ${metadata.contentType}`);

    // Retrieve the data
    console.log('Retrieving stored data...');
    const retrievedData = await client.read(storeResponse.blob.blobId);

    // Decode and display the retrieved data
    const decodedData = new TextDecoder().decode(retrievedData);
    console.log(`Retrieved data: ${decodedData}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Only run if this file is being executed directly
if (import.meta.main) {
  main().catch(console.error);
}
```

## File: examples/custom-client.ts
```typescript
/**
 * Custom Client Configuration Example
 * 
 * This example demonstrates how to create a Walrus client with
 * custom configuration options.
 */

import { createWalrusClient } from '../src';

async function main() {
  console.log('Creating a Walrus client with custom configuration...');

  // Create client with custom endpoints and configuration
  const client = createWalrusClient({
    // Custom aggregator endpoints
    aggregatorURLs: [
      'https://aggregator.walrus-testnet.walrus.space',
      'https://wal-aggregator-testnet.staketab.org'
    ],

    // Custom publisher endpoints
    publisherURLs: [
      'https://publisher.walrus-testnet.walrus.space',
      'https://wal-publisher-testnet.staketab.org'
    ],

    // Custom retry configuration
    maxRetries: 3,
    retryDelay: 1000, // 1 second

    // Custom upload size limit (for streams with unknown length)
    maxUnknownLengthUploadSize: 10 * 1024 * 1024, // 10MB

    // Custom fetch implementation (just using default here)
    fetch: fetch,
  });

  console.log('Client created with custom configuration');

  try {
    // Test the client with a simple operation
    console.log('\nTesting client by storing a small piece of data...');
    const data = new TextEncoder().encode('Testing custom client configuration');

    const storeResponse = await client.store(data, { epochs: 5 });
    console.log(`Data stored successfully with blob ID: ${storeResponse.blob.blobId}`);

    // Get metadata to verify
    const metadata = await client.head(storeResponse.blob.blobId);
    console.log(`Content size: ${metadata.contentLength} bytes`);

    // Read back the data
    const retrievedData = await client.read(storeResponse.blob.blobId);
    console.log(`Retrieved data: ${new TextDecoder().decode(retrievedData)}`);

    // Get API spec
    console.log('\nRetrieving API specification from aggregator...');
    const apiSpec = await client.getAPISpec(true);
    console.log(`API spec retrieved (${apiSpec.byteLength} bytes)`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Only run if this file is being executed directly
if (import.meta.main) {
  main().catch(console.error);
}
```

## File: examples/encrypted-storage.ts
```typescript
/**
 * Encrypted Storage Example
 * 
 * This example demonstrates how to store and retrieve encrypted data 
 * using the Walrus SDK with both GCM and CBC encryption modes.
 */

import { createWalrusClient, CipherSuite } from '../src';

async function main() {
  // Initialize client
  const client = createWalrusClient();

  // Create some data to encrypt and store
  const sensitiveData = new TextEncoder().encode('This is sensitive information that will be encrypted');

  console.log('Demonstrating AES-GCM encryption (recommended)...');

  try {
    // Generate a random encryption key (32 bytes for AES-256)
    const key = crypto.getRandomValues(new Uint8Array(32));
    console.log('Generated encryption key:', bytesToHex(key));

    // Store with GCM encryption
    const gcmResponse = await client.store(sensitiveData, {
      epochs: 10,
      encryption: {
        key,
        suite: CipherSuite.AES256GCM // GCM mode (recommended, provides authentication)
      }
    });

    console.log(`Encrypted data stored with blob ID: ${gcmResponse.blob.blobId}`);

    // Try to read without decryption - will get encrypted bytes
    console.log('Attempting to read without decryption...');
    const encryptedData = await client.read(gcmResponse.blob.blobId);
    console.log(`Raw encrypted data (${encryptedData.byteLength} bytes):`);
    console.log(bytesToHex(encryptedData).substring(0, 64) + '...');

    // Read with decryption
    console.log('Reading with proper decryption...');
    const decryptedData = await client.read(gcmResponse.blob.blobId, {
      encryption: {
        key,
        suite: CipherSuite.AES256GCM
      }
    });

    console.log(`Decrypted data: ${new TextDecoder().decode(decryptedData)}`);

    // Demonstrate CBC mode which requires an IV
    console.log('\nDemonstrating AES-CBC encryption...');

    // Generate IV for CBC mode
    const iv = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes for AES block size
    console.log('Generated IV:', bytesToHex(iv));

    // Store with CBC encryption
    const cbcResponse = await client.store(sensitiveData, {
      epochs: 10,
      encryption: {
        key,
        suite: CipherSuite.AES256CBC,
        iv // CBC mode requires an explicit IV
      }
    });

    console.log(`CBC encrypted data stored with blob ID: ${cbcResponse.blob.blobId}`);

    // Read with CBC decryption (requires same key and IV)
    const cbcDecrypted = await client.read(cbcResponse.blob.blobId, {
      encryption: {
        key,
        suite: CipherSuite.AES256CBC,
        iv
      }
    });

    console.log(`CBC decrypted data: ${new TextDecoder().decode(cbcDecrypted)}`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Helper function to convert bytes to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Only run if this file is being executed directly
if (import.meta.main) {
  main().catch(console.error);
}
```

## File: examples/error-handling.ts
```typescript
/**
 * Error Handling Example
 * 
 * This example demonstrates how to handle errors when using the Walrus SDK.
 */

import { createWalrusClient, createWalrusError } from '../src';
import type { WalrusError } from '../src';

async function main() {
  // Initialize client
  const client = createWalrusClient();

  console.log('Demonstrating error handling in Walrus SDK...');

  // Example 1: Invalid blob ID
  console.log('\nExample 1: Trying to read a non-existent blob ID');
  try {
    const invalidBlobId = 'non-existent-blob-id';
    console.log(`Attempting to read blob ID: ${invalidBlobId}`);

    await client.read(invalidBlobId);

    // This line will not be reached if an error is thrown
    console.log('Success (unexpected)');
  } catch (error: unknown) {
    console.log('Caught error as expected:');
    if (error instanceof Error) {
      console.log(`- Error name: ${error.name}`);
      console.log(`- Error message: ${error.message}`);

      // Check if it's a WalrusError
      if (error.name === 'WalrusError') {
        const walrusError = error as WalrusError;
        console.log(`- Status code: ${walrusError.statusCode || 'N/A'}`);
      }
    } else {
      console.log(`- Unknown error: ${String(error)}`);
    }
  }

  // Example 2: Invalid encryption parameters
  console.log('\nExample 2: Using invalid encryption parameters');
  try {
    // Create some data
    const data = new TextEncoder().encode('Test data');

    // Try to encrypt with an invalid key (too short)
    const invalidKey = new Uint8Array(15); // AES keys must be 16, 24, or 32 bytes

    console.log('Attempting to store with invalid encryption key (15 bytes)');
    await client.store(data, {
      epochs: 10,
      encryption: {
        key: invalidKey,
        // The encryption module will throw an error due to invalid key size
      }
    });

    // This line will not be reached if an error is thrown
    console.log('Success (unexpected)');
  } catch (error: unknown) {
    console.log('Caught error as expected:');
    if (error instanceof Error) {
      console.log(`- Error name: ${error.name}`);
      console.log(`- Error message: ${error.message}`);
    } else {
      console.log(`- Unknown error: ${String(error)}`);
    }
  }

  // Example 3: Manual error creation
  console.log('\nExample 3: Creating and throwing custom Walrus errors');
  try {
    // Simulate a validation function that throws a custom error
    function validateParameters(fileSize: number) {
      const MAX_SIZE = 1024 * 1024 * 100; // 100MB

      if (fileSize <= 0) {
        throw createWalrusError('File size must be positive');
      }

      if (fileSize > MAX_SIZE) {
        throw createWalrusError('File exceeds maximum size limit', {
          statusCode: 413 // Request Entity Too Large
        });
      }

      return true;
    }

    // Try with an invalid size
    const oversizedFile = 1024 * 1024 * 200; // 200MB
    console.log(`Validating file size: ${oversizedFile} bytes`);
    validateParameters(oversizedFile);

    // This line will not be reached if an error is thrown
    console.log('Validation successful (unexpected)');
  } catch (error: unknown) {
    console.log('Caught error as expected:');
    if (error instanceof Error) {
      console.log(`- Error name: ${error.name}`);
      console.log(`- Error message: ${error.message}`);

      // Check if it's a WalrusError
      if (error.name === 'WalrusError') {
        const walrusError = error as WalrusError;
        console.log(`- Status code: ${walrusError.statusCode || 'N/A'}`);
      }
    } else {
      console.log(`- Unknown error: ${String(error)}`);
    }
  }

  // Example 4: Network error simulation
  console.log('\nExample 4: Handling network errors');
  try {
    // Create a client with invalid endpoints
    const badClient = createWalrusClient({
      aggregatorURLs: ['https://invalid-endpoint.example.com'],
      publisherURLs: ['https://invalid-endpoint.example.com'],
      maxRetries: 1, // Only retry once to make the example faster
      retryDelay: 100 // Short delay
    });

    console.log('Attempting to store data with invalid endpoints');
    await badClient.store(new TextEncoder().encode('Test data'), { epochs: 5 });

    // This line will not be reached if an error is thrown
    console.log('Success (unexpected)');
  } catch (error: unknown) {
    console.log('Caught error as expected:');
    if (error instanceof Error) {
      console.log(`- Error name: ${error.name}`);
      console.log(`- Error message: ${error.message}`);
    } else {
      console.log(`- Unknown error: ${String(error)}`);
    }
  }

  console.log('\nAll error handling examples completed.');
}

// Only run if this file is being executed directly
if (import.meta.main) {
  main().catch(console.error);
}
```

## File: examples/file-operations.ts
```typescript
/**
 * File Operations Example
 * 
 * This example demonstrates how to work with files and streams
 * using the Walrus SDK.
 */

import { createWalrusClient } from '../src';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

async function main() {
  // Initialize client
  const client = createWalrusClient();

  try {
    // Create a temporary directory for our example files
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'walrus-'));
    console.log(`Created temporary directory: ${tempDir}`);

    // Create a test file
    const testFilePath = path.join(tempDir, 'test-file.txt');
    const fileContent = 'This is a test file for Walrus SDK file operations.';
    await fs.promises.writeFile(testFilePath, fileContent);
    console.log(`Created test file at: ${testFilePath}`);

    // Store the file
    console.log('Storing file to Walrus...');
    const storeResponse = await client.storeFile(testFilePath, { epochs: 10 });
    const blobId = storeResponse.blob.blobId;
    console.log(`File stored with blob ID: ${blobId}`);

    // Read the blob metadata
    const metadata = await client.head(blobId);
    console.log(`File size: ${metadata.contentLength} bytes`);
    console.log(`Content type: ${metadata.contentType}`);

    // Save the blob to a new file
    const downloadPath = path.join(tempDir, 'downloaded-file.txt');
    console.log(`Saving blob to: ${downloadPath}`);
    await client.readToFile(blobId, downloadPath);

    // Verify the downloaded content
    const downloadedContent = await fs.promises.readFile(downloadPath, 'utf-8');
    console.log(`Downloaded content: "${downloadedContent}"`);
    console.log(`Content matches original: ${downloadedContent === fileContent}`);

    // Demonstrate stream operations
    console.log('\nDemonstrating stream operations...');

    // Create a larger file for stream demo
    const largeFilePath = path.join(tempDir, 'large-file.txt');
    const largeContent = 'A'.repeat(1024 * 10); // 10KB of data
    await fs.promises.writeFile(largeFilePath, largeContent);

    // Create a read stream
    const readStream = fs.createReadStream(largeFilePath);
    const readableStream = Bun.file(largeFilePath).stream();

    // Store from stream
    console.log('Storing from stream...');
    const streamResponse = await client.storeFromStream(readableStream, { epochs: 10 });
    const streamBlobId = streamResponse.blob.blobId;
    console.log(`Stream stored with blob ID: ${streamBlobId}`);

    // Create a write stream for downloading
    const streamDownloadPath = path.join(tempDir, 'stream-downloaded.txt');
    console.log(`Reading to stream and saving to: ${streamDownloadPath}`);

    // Get a readable stream from the blob
    const blobStream = await client.readToStream(streamBlobId);

    // In a real application you would use pipe to write to file,
    // but for this example we'll read the stream and write manually
    const chunks: Uint8Array[] = [];
    const reader = blobStream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine chunks and write to file
    const combinedData = new Uint8Array(
      chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0)
    );

    let offset = 0;
    for (const chunk of chunks) {
      combinedData.set(chunk, offset);
      offset += chunk.byteLength;
    }

    await fs.promises.writeFile(streamDownloadPath, combinedData);

    // Verify the streamed content
    const streamedContent = await fs.promises.readFile(streamDownloadPath, 'utf-8');
    console.log(`Streamed content length: ${streamedContent.length} bytes`);
    console.log(`Streamed content matches original: ${streamedContent === largeContent}`);

    // Clean up temporary files
    console.log('\nCleaning up temporary files...');
    await fs.promises.rm(tempDir, { recursive: true });
    console.log('Cleanup complete');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Only run if this file is being executed directly
if (import.meta.main) {
  main().catch(console.error);
}
```

## File: examples/json-operations.ts
```typescript
/**
 * JSON Operations Example
 * 
 * This example demonstrates how to store and retrieve JSON data
 * using the Walrus SDK.
 */

import { createWalrusClient } from "../src";

async function main() {
  // Initialize client
  const client = createWalrusClient();

  try {
    // Create some JSON data to store
    const jsonData = {
      name: "Walrus Protocol",
      description: "Decentralized storage on Sui",
      features: ["Fast", "Secure", "Decentralized"],
      metrics: {
        reliability: 99.9,
        nodes: 42,
        storageCapacity: "1PB"
      },
      active: true,
      timestamp: new Date().toISOString()
    };

    console.log("JSON data to store:", jsonData);
    console.log("\nStoring JSON data to Walrus...");

    // Store the JSON data for 10 epochs
    const storeResponse = await client.storeJSON(jsonData, { epochs: 10 });

    console.log(`JSON data stored with blob ID: ${storeResponse.blob.blobId}`);
    console.log(`Will be available until epoch: ${storeResponse.blob.endEpoch}`);

    // Get metadata about the stored blob
    const metadata = await client.head(storeResponse.blob.blobId);
    console.log(`Content size: ${metadata.contentLength} bytes`);
    console.log(`Content type: ${metadata.contentType}`);

    // Retrieve the JSON data
    console.log("\nRetrieving stored JSON data...");
    const retrievedData = await client.readJSON(storeResponse.blob.blobId);

    // Display the retrieved data
    console.log("Retrieved JSON data:", retrievedData);

    // Demonstrate with generic type parameter for type safety
    interface ConfigData {
      name: string;
      features: string[];
      metrics: {
        reliability: number;
        nodes: number;
        storageCapacity: string;
      };
      active: boolean;
      timestamp: string;
    }

    // Retrieve with type checking
    console.log("\nRetrieving with type checking...");
    const typedData = await client.readJSON<ConfigData>(storeResponse.blob.blobId);
    console.log(`Name: ${typedData.name}`);
    console.log(`Features: ${typedData.features.join(", ")}`);
    console.log(`Reliability: ${typedData.metrics.reliability}%`);
    console.log(`Active: ${typedData.active}`);

    // Demonstrate with encryption
    console.log("\nDemonstrating encrypted JSON storage...");

    // Generate a random encryption key (32 bytes for AES-256)
    const key = crypto.getRandomValues(new Uint8Array(32));
    console.log(`Generated encryption key: ${bytesToHex(key).substring(0, 16)}...`);

    // Store sensitive JSON with encryption
    const sensitiveData = {
      apiKey: "secret-api-key-12345",
      accessToken: "jwt-token-with-sensitive-data",
      userInfo: {
        id: 123456,
        email: "user@example.com",
        role: "admin"
      }
    };

    const encryptedResponse = await client.storeJSON(sensitiveData, {
      epochs: 5,
      encryption: {
        key
      }
    });

    console.log(`Encrypted JSON stored with blob ID: ${encryptedResponse.blob.blobId}`);

    // Try to read without decryption - will throw an error when parsing
    console.log("\nAttempting to read encrypted JSON without decryption...");
    try {
      await client.readJSON(encryptedResponse.blob.blobId);
    } catch (error) {
      console.log("Error as expected:", (error as Error).message);
    }

    // Read with decryption
    console.log("\nReading encrypted JSON with proper decryption...");
    const decryptedData = await client.readJSON(encryptedResponse.blob.blobId, {
      encryption: {
        key
      }
    });

    console.log("Decrypted sensitive data:", decryptedData);

  } catch (error) {
    console.error("Error:", error);
  }
}

// Helper function to convert bytes to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Only run if this file is being executed directly
if (import.meta.main) {
  main().catch(console.error);
}
```

## File: examples/url-operations.ts
```typescript
/**
 * URL Operations Example
 * 
 * This example demonstrates how to store content from remote URLs
 * using the Walrus SDK.
 */

import { createWalrusClient } from '../src';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

async function main() {
  // Initialize client
  const client = createWalrusClient();

  try {
    // Create a temporary directory for downloads
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'walrus-url-'));
    console.log(`Created temporary directory: ${tempDir}`);

    // URLs to download and store
    const urls = [
      'https://raw.githubusercontent.com/MystenLabs/sui/main/README.md',
      'https://avatars.githubusercontent.com/u/110161859', // MystenLabs GitHub avatar
    ];

    for (const [index, url] of urls.entries()) {
      console.log(`\nExample ${index + 1}: Storing content from URL: ${url}`);

      // Store from URL
      console.log('Fetching and storing content...');
      const storeResponse = await client.storeFromURL(url, { epochs: 10 });
      const blobId = storeResponse.blob.blobId;
      console.log(`Content stored with blob ID: ${blobId}`);

      // Get metadata
      const metadata = await client.head(blobId);
      console.log(`Content size: ${metadata.contentLength} bytes`);
      console.log(`Content type: ${metadata.contentType}`);

      // Download to file
      const extension = getExtensionFromContentType(metadata.contentType || '');
      const downloadPath = path.join(tempDir, `download-${index + 1}${extension}`);
      console.log(`Saving to: ${downloadPath}`);
      await client.readToFile(blobId, downloadPath);

      // Get file stats
      const stats = await fs.promises.stat(downloadPath);
      console.log(`File saved successfully (${stats.size} bytes)`);
    }

    // Clean up
    console.log('\nCleaning up temporary files...');
    await fs.promises.rm(tempDir, { recursive: true });
    console.log('Cleanup complete');

  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Helper function to guess a file extension from a MIME type
 */
function getExtensionFromContentType(contentType: string): string {
  const extensions: Record<string, string> = {
    'text/plain': '.txt',
    'text/html': '.html',
    'text/css': '.css',
    'text/javascript': '.js',
    'application/json': '.json',
    'application/xml': '.xml',
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'application/octet-stream': '.bin',
    'application/markdown': '.md',
    'text/markdown': '.md',
  };

  // Get the base content type without parameters
  const baseType = contentType.split(';')[0]?.trim();

  return extensions[baseType || ''] || '';
}

// Only run if this file is being executed directly
if (import.meta.main) {
  main().catch(console.error);
}
```

## File: src/client/walrus-client.ts
```typescript
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
    return normalizeBlobResponse(responseData);
  };

  /**
   * Stores JSON data on the Walrus Publisher
   * @param data JSON-serializable data to store
   * @param options Storage options
   * @returns Response with blob information
   */
  const storeJSON = async (data: unknown, options: StoreOptions = {}): Promise<StoreResponse> => {
    try {
      // Convert JSON to string
      const jsonString = JSON.stringify(data);

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
        throw createWalrusError(`Failed to store JSON data: ${error.message}`, { cause: error });
      }
      throw createWalrusError('Failed to store JSON data: unknown error');
    }
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

    // Auto-detect content type from filename if not explicitly provided
    const requestOptions: StoreOptions = {
      ...options,
      contentType: options.contentType || getContentTypeFromFilename(filePath)
    };

    // Store the file content
    return store(data, requestOptions);
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
   * Retrieves JSON data from the Walrus Aggregator
   * @param blobId Blob ID to retrieve
   * @param options Read options
   * @returns Retrieved and parsed JSON data
   */
  const readJSON = async <T = unknown>(blobId: string, options: ReadOptions = {}): Promise<T> => {
    try {
      // Read the binary data
      const data = await read(blobId, options);

      // Convert binary data to string
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(data);

      // Parse the JSON string
      return JSON.parse(jsonString) as T;
    } catch (error) {
      if (error instanceof Error) {
        throw createWalrusError(`Failed to read JSON data: ${error.message}`, { cause: error });
      }
      throw createWalrusError('Failed to read JSON data: unknown error');
    }
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
```

## File: src/encryption/cbc.ts
```typescript
import type { ContentCipher, CipherOptions } from './interfaces';
import { validateAesKey, validateUint8Array } from '../utils/helpers';
import { createWalrusError } from '../types';

// Magic bytes to identify encrypted content (WAL)
const MAGIC_BYTES = new Uint8Array([0x57, 0x41, 0x4C]);

// AES-CBC parameters
const IV_LENGTH = 16; // 128 bits for CBC mode
const CBC_BLOCK_SIZE = 16; // 128 bits

/**
 * Creates a ContentCipher implementation using AES-CBC
 * @param options Cipher options containing key and IV
 * @returns An implementation of the ContentCipher interface
 */
export function createCBCCipher(options: CipherOptions): ContentCipher {
  // Validate options
  validateAesKey(options.key);

  if (!options.iv) {
    throw createWalrusError('Initialization vector (IV) is required for CBC mode');
  }

  validateUint8Array(options.iv, 'IV', IV_LENGTH);

  // Private state
  const keyData = options.key;
  const iv = options.iv;
  const subtle = crypto.subtle;
  let key: CryptoKey | null = null;

  /**
   * Imports the raw key bytes into a CryptoKey object
   */
  const importKey = async (): Promise<CryptoKey> => {
    if (key) return key;

    try {
      key = await subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-CBC' },
        false, // not extractable
        ['encrypt', 'decrypt']
      );
      return key;
    } catch (error) {
      throw createWalrusError('Failed to import key for AES-CBC', { cause: error });
    }
  };

  /**
   * Ensures the key is available or initializes it
   */
  const ensureKey = async (): Promise<CryptoKey> => {
    if (!key) {
      key = await importKey();
    }

    if (!key) {
      throw createWalrusError('Failed to initialize encryption key');
    }

    return key;
  };

  /**
   * Adds PKCS#7 padding to the data
   */
  const padData = (data: Uint8Array): Uint8Array => {
    const paddingLength = CBC_BLOCK_SIZE - (data.length % CBC_BLOCK_SIZE);
    const padded = new Uint8Array(data.length + paddingLength);
    padded.set(data);

    // PKCS#7 padding - fill with the padding length value
    padded.fill(paddingLength, data.length);

    return padded;
  };

  /**
   * Removes PKCS#7 padding from the data
   */
  const unpadData = (data: Uint8Array): Uint8Array => {
    if (data.length === 0) {
      return data;
    }

    // Get the padding length from the last byte
    const paddingLength = data[data.length - 1] as number;

    // Validate the padding length
    if (paddingLength <= 0 || paddingLength > CBC_BLOCK_SIZE) {
      throw createWalrusError('Invalid padding length');
    }

    // Validate padding (all padding bytes should be the same)
    for (let i = data.length - paddingLength; i < data.length; i++) {
      if (data[i] !== paddingLength) {
        throw createWalrusError('Invalid padding');
      }
    }

    // Return the data without padding
    return data.slice(0, data.length - paddingLength);
  };

  /**
   * Reads all data from a stream and combines it into a single Uint8Array
   */
  const readStreamToUint8Array = async (src: ReadableStream<Uint8Array>): Promise<Uint8Array> => {
    const reader = src.getReader();
    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        totalLength += value.byteLength;
      }
    } finally {
      reader.releaseLock();
    }

    // Combine all chunks
    const data = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return data;
  };

  /**
   * Encrypts a Uint8Array using AES-CBC
   */
  const encrypt = async (data: Uint8Array): Promise<Uint8Array> => {
    const cryptoKey = await ensureKey();

    // Pad the data to a multiple of the block size
    const padded = padData(data);

    try {
      // Encrypt the data
      const ciphertext = new Uint8Array(
        await subtle.encrypt(
          { name: 'AES-CBC', iv },
          cryptoKey,
          padded
        )
      );

      // Combine magic bytes, IV, and ciphertext
      const result = new Uint8Array(MAGIC_BYTES.length + IV_LENGTH + ciphertext.length);
      result.set(MAGIC_BYTES, 0);
      result.set(iv, MAGIC_BYTES.length);
      result.set(ciphertext, MAGIC_BYTES.length + IV_LENGTH);

      return result;
    } catch (error) {
      throw createWalrusError('Encryption failed', { cause: error });
    }
  };

  /**
   * Decrypts a Uint8Array using AES-CBC
   */
  const decrypt = async (data: Uint8Array): Promise<Uint8Array> => {
    const cryptoKey = await ensureKey();

    // Check for magic bytes
    if (data.length < MAGIC_BYTES.length + IV_LENGTH) {
      throw createWalrusError('Invalid encrypted data: too short');
    }

    for (let i = 0; i < MAGIC_BYTES.length; i++) {
      if (data[i] !== MAGIC_BYTES[i]) {
        throw createWalrusError('Invalid encrypted data: invalid magic bytes');
      }
    }

    // Extract IV and ciphertext
    const extractedIv = data.slice(MAGIC_BYTES.length, MAGIC_BYTES.length + IV_LENGTH);
    const ciphertext = data.slice(MAGIC_BYTES.length + IV_LENGTH);

    try {
      // Decrypt the data
      const decrypted = new Uint8Array(
        await subtle.decrypt(
          { name: 'AES-CBC', iv: extractedIv },
          cryptoKey,
          ciphertext
        )
      );

      // Remove padding
      return unpadData(decrypted);
    } catch (error) {
      throw createWalrusError('Decryption failed', { cause: error });
    }
  };

  /**
   * Encrypts data from a source stream and writes it to a destination stream
   */
  const encryptStream = async (
    src: ReadableStream<Uint8Array>,
    dst: WritableStream<Uint8Array>
  ): Promise<void> => {
    // Read all data from the source stream
    const data = await readStreamToUint8Array(src);

    // Encrypt the combined data
    const encrypted = await encrypt(data);

    // Write to the destination stream
    const writer = dst.getWriter();
    try {
      await writer.write(encrypted);
    } finally {
      await writer.close();
    }
  };

  /**
   * Decrypts data from a source stream and writes it to a destination stream
   */
  const decryptStream = async (
    src: ReadableStream<Uint8Array>,
    dst: WritableStream<Uint8Array>
  ): Promise<void> => {
    // Read all data from the source stream
    const data = await readStreamToUint8Array(src);

    // Decrypt the combined data
    const decrypted = await decrypt(data);

    // Write to the destination stream
    const writer = dst.getWriter();
    try {
      await writer.write(decrypted);
    } finally {
      await writer.close();
    }
  };

  // Return an object implementing the ContentCipher interface
  return {
    encrypt,
    decrypt,
    encryptStream,
    decryptStream
  };
}
```

## File: src/encryption/gcm.ts
```typescript
import type { ContentCipher } from './interfaces';
import { validateAesKey } from '../utils/helpers';
import { createWalrusError } from '../types';

// Magic bytes to identify encrypted content (WAL)
const MAGIC_BYTES = new Uint8Array([0x57, 0x41, 0x4C]);

// AES-GCM parameters
const IV_LENGTH = 12; // 96 bits as recommended for GCM
const TAG_LENGTH = 16; // 128 bits authentication tag

/**
 * Creates a ContentCipher implementation using AES-GCM
 * @param keyData Raw key bytes (must be 16, 24, or 32 bytes)
 * @returns An implementation of the ContentCipher interface
 */
export function createGCMCipher(keyData: Uint8Array): ContentCipher {
  // Validate key before proceeding
  validateAesKey(keyData);

  // Private state
  let key: CryptoKey | null = null;
  const subtle = crypto.subtle;

  /**
   * Imports the raw key bytes into a CryptoKey
   */
  const importKey = async (): Promise<CryptoKey> => {
    if (key) return key;

    try {
      key = await subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false, // Not extractable
        ['encrypt', 'decrypt'] // Key usages
      );
      return key;
    } catch (error) {
      throw createWalrusError('Failed to import key for AES-GCM', { cause: error });
    }
  };

  /**
   * Ensures that the crypto key is available, importing it if necessary
   */
  const ensureKey = async (): Promise<CryptoKey> => {
    if (!key) {
      key = await importKey();
    }

    if (!key) {
      throw createWalrusError('Failed to initialize encryption key');
    }

    return key;
  };

  /**
   * Encrypts a Uint8Array using AES-GCM
   * @param data Plaintext data to encrypt
   * @returns Encrypted data with format: [magic bytes][iv][ciphertext]
   */
  const encrypt = async (data: Uint8Array): Promise<Uint8Array> => {
    const cryptoKey = await ensureKey();

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Encrypt the data
    const ciphertext = await subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: TAG_LENGTH * 8 // In bits
      },
      cryptoKey,
      data
    );

    // Combine magic bytes, IV, and ciphertext
    const result = new Uint8Array(MAGIC_BYTES.length + iv.length + ciphertext.byteLength);
    result.set(MAGIC_BYTES, 0);
    result.set(iv, MAGIC_BYTES.length);
    result.set(new Uint8Array(ciphertext), MAGIC_BYTES.length + iv.length);

    return result;
  };

  /**
   * Decrypts a Uint8Array using AES-GCM
   * @param data Encrypted data in format: [magic bytes][iv][ciphertext]
   * @returns Decrypted plaintext
   */
  const decrypt = async (data: Uint8Array): Promise<Uint8Array> => {
    const cryptoKey = await ensureKey();

    // Check magic bytes
    const magicBytesSlice = data.slice(0, MAGIC_BYTES.length);
    if (!MAGIC_BYTES.every((byte, i) => byte === magicBytesSlice[i])) {
      throw createWalrusError('Invalid encrypted data: missing magic bytes');
    }

    // Extract IV and ciphertext
    const iv = data.slice(MAGIC_BYTES.length, MAGIC_BYTES.length + IV_LENGTH);
    const ciphertext = data.slice(MAGIC_BYTES.length + IV_LENGTH);

    try {
      // Decrypt the data
      const plaintext = await subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
          tagLength: TAG_LENGTH * 8 // In bits
        },
        cryptoKey,
        ciphertext
      );

      return new Uint8Array(plaintext);
    } catch (error) {
      throw createWalrusError('Decryption failed: invalid key or corrupted data', { cause: error });
    }
  };

  /**
   * Process all data from a stream and combine into a single Uint8Array
   */
  const readStreamToUint8Array = async (src: ReadableStream<Uint8Array>): Promise<Uint8Array> => {
    const reader = src.getReader();
    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        totalLength += value.byteLength;
      }
    } finally {
      reader.releaseLock();
    }

    // Combine chunks
    const data = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return data;
  };

  /**
   * Encrypts data from a source stream and writes it to a destination stream
   * @param src Source readable stream containing plaintext
   * @param dst Destination writable stream to receive ciphertext
   */
  const encryptStream = async (
    src: ReadableStream<Uint8Array>,
    dst: WritableStream<Uint8Array>
  ): Promise<void> => {
    // Read all data from the source stream
    const data = await readStreamToUint8Array(src);

    // Encrypt the combined data
    const encrypted = await encrypt(data);

    // Write the encrypted data to the destination stream
    const writer = dst.getWriter();
    try {
      await writer.write(encrypted);
    } finally {
      await writer.close();
    }
  };

  /**
   * Decrypts data from a source stream and writes it to a destination stream
   * @param src Source readable stream containing ciphertext
   * @param dst Destination writable stream to receive plaintext
   */
  const decryptStream = async (
    src: ReadableStream<Uint8Array>,
    dst: WritableStream<Uint8Array>
  ): Promise<void> => {
    // Read all data from the source stream
    const data = await readStreamToUint8Array(src);

    // Decrypt the combined data
    const decrypted = await decrypt(data);

    // Write the decrypted data to the destination stream
    const writer = dst.getWriter();
    try {
      await writer.write(decrypted);
    } finally {
      await writer.close();
    }
  };

  // Return an object implementing the ContentCipher interface
  return {
    encrypt,
    decrypt,
    encryptStream,
    decryptStream
  };
}
```

## File: src/encryption/index.ts
```typescript
import type { ContentCipher, CipherOptions } from './interfaces';
import { createGCMCipher } from './gcm';
import { createCBCCipher } from './cbc';
import { CipherSuite, createWalrusError } from '../types';

/**
 * Creates a cipher implementation based on the specified options
 * @param options Cipher options
 * @returns A ContentCipher implementation
 */
export function createCipher(options: CipherOptions): ContentCipher {
  // Validate key
  if (!(options.key instanceof Uint8Array)) {
    throw createWalrusError('Encryption key must be a Uint8Array');
  }

  // Create the appropriate cipher based on the suite
  switch (options.suite) {
    case CipherSuite.AES256GCM:
      return createGCMCipher(options.key);

    case CipherSuite.AES256CBC:
      if (!options.iv) {
        throw createWalrusError('Initialization vector (IV) is required for AES-CBC mode');
      }
      return createCBCCipher(options);

    default:
      throw createWalrusError(`Unsupported cipher suite: ${options.suite}`);
  }
}

// Re-export types
export type { ContentCipher, CipherOptions } from './interfaces';
export { CipherSuite } from '../types';
```

## File: src/encryption/interfaces.ts
```typescript
import type { CipherSuite } from '../types';

/**
 * Interface for content encryption and decryption
 */
export interface ContentCipher {
  /**
   * Encrypts data from a source stream and writes it to a destination stream
   * @param src Source readable stream containing plaintext
   * @param dst Destination writable stream to receive ciphertext
   */
  encryptStream(src: ReadableStream<Uint8Array>, dst: WritableStream<Uint8Array>): Promise<void>;

  /**
   * Decrypts data from a source stream and writes it to a destination stream
   * @param src Source readable stream containing ciphertext
   * @param dst Destination writable stream to receive plaintext
   */
  decryptStream(src: ReadableStream<Uint8Array>, dst: WritableStream<Uint8Array>): Promise<void>;

  /**
   * Encrypts a Uint8Array
   * @param data Plaintext data to encrypt
   * @returns Encrypted data
   */
  encrypt(data: Uint8Array): Promise<Uint8Array>;

  /**
   * Decrypts a Uint8Array
   * @param data Encrypted data to decrypt
   * @returns Decrypted data
   */
  decrypt(data: Uint8Array): Promise<Uint8Array>;
}

/**
 * Options for creating a cipher
 */
export interface CipherOptions {
  /**
   * The encryption/decryption key
   * Should be 16, 24, or 32 bytes for AES-128, AES-192, or AES-256
   */
  key: Uint8Array;

  /**
   * The encryption suite to use
   */
  suite: CipherSuite;

  /**
   * Initialization Vector, required for CBC mode
   * Must be 16 bytes
   */
  iv?: Uint8Array;
}
```

## File: src/tests/encryption.test.ts
```typescript
import { describe, expect, test } from "bun:test";
import { createCipher } from "../encryption/index";
import { CipherSuite } from "../types";

describe("Encryption Module", () => {
  // Test data
  const plaintext = new TextEncoder().encode("Hello, Walrus Protocol!");

  // Test keys (32 bytes for AES-256)
  const key = new Uint8Array(32).fill(1);
  const iv = new Uint8Array(16).fill(2); // For CBC mode

  describe("GCM Cipher", () => {
    test("should encrypt and decrypt data correctly", async () => {
      const cipher = createCipher({
        key,
        suite: CipherSuite.AES256GCM
      });

      // Encrypt the data
      const encrypted = await cipher.encrypt(plaintext);

      // Encrypted data should be longer than plaintext (magic bytes + IV + tag)
      expect(encrypted.byteLength).toBeGreaterThan(plaintext.byteLength);

      // Decrypt the data
      const decrypted = await cipher.decrypt(encrypted);

      // Compare the decrypted data with the original
      expect(decrypted.byteLength).toBe(plaintext.byteLength);
      expect(new TextDecoder().decode(decrypted)).toBe(new TextDecoder().decode(plaintext));
    });

    test("should throw on invalid encrypted data", async () => {
      const cipher = createCipher({
        key,
        suite: CipherSuite.AES256GCM
      });

      // Try to decrypt invalid data
      const invalidData = new Uint8Array(10).fill(0);
      await expect(cipher.decrypt(invalidData)).rejects.toThrow();
    });
  });

  describe("CBC Cipher", () => {
    test("should encrypt and decrypt data correctly", async () => {
      const cipher = createCipher({
        key,
        suite: CipherSuite.AES256CBC,
        iv
      });

      // Encrypt the data
      const encrypted = await cipher.encrypt(plaintext);

      // Encrypted data should be longer than plaintext (magic bytes + IV + padding)
      expect(encrypted.byteLength).toBeGreaterThan(plaintext.byteLength);

      // Decrypt the data
      const decrypted = await cipher.decrypt(encrypted);

      // Compare the decrypted data with the original
      expect(decrypted.byteLength).toBe(plaintext.byteLength);
      expect(new TextDecoder().decode(decrypted)).toBe(new TextDecoder().decode(plaintext));
    });

    test("should throw when IV is missing", async () => {
      // Try to create a CBC cipher without IV
      expect(() => createCipher({
        key,
        suite: CipherSuite.AES256CBC
      })).toThrow();
    });

    test("should throw on invalid encrypted data", async () => {
      const cipher = createCipher({
        key,
        suite: CipherSuite.AES256CBC,
        iv
      });

      // Try to decrypt invalid data
      const invalidData = new Uint8Array(10).fill(0);
      await expect(cipher.decrypt(invalidData)).rejects.toThrow();
    });
  });

  describe("Stream Encryption", () => {
    test("should encrypt and decrypt streams correctly", async () => {
      const cipher = createCipher({
        key,
        suite: CipherSuite.AES256GCM
      });

      // Create source stream with plaintext
      const sourceStream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(plaintext);
          controller.close();
        }
      });

      // Create destination stream for encrypted data
      const encryptedChunks: Uint8Array[] = [];
      const encryptDest = new WritableStream<Uint8Array>({
        write(chunk) {
          encryptedChunks.push(chunk);
        }
      });

      // Encrypt the stream
      await cipher.encryptStream(sourceStream, encryptDest);

      // Combine encrypted chunks
      let totalLength = 0;
      for (const chunk of encryptedChunks) {
        totalLength += chunk.byteLength;
      }

      const encryptedData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of encryptedChunks) {
        encryptedData.set(chunk, offset);
        offset += chunk.byteLength;
      }

      // Create source stream with encrypted data
      const encryptedStream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encryptedData);
          controller.close();
        }
      });

      // Create destination stream for decrypted data
      const decryptedChunks: Uint8Array[] = [];
      const decryptDest = new WritableStream<Uint8Array>({
        write(chunk) {
          decryptedChunks.push(chunk);
        }
      });

      // Decrypt the stream
      await cipher.decryptStream(encryptedStream, decryptDest);

      // Combine decrypted chunks
      totalLength = 0;
      for (const chunk of decryptedChunks) {
        totalLength += chunk.byteLength;
      }

      const decryptedData = new Uint8Array(totalLength);
      offset = 0;
      for (const chunk of decryptedChunks) {
        decryptedData.set(chunk, offset);
        offset += chunk.byteLength;
      }

      // Compare the decrypted data with the original
      expect(decryptedData.byteLength).toBe(plaintext.byteLength);
      expect(new TextDecoder().decode(decryptedData)).toBe(new TextDecoder().decode(plaintext));
    });
  });
});
```

## File: src/types/index.ts
```typescript
/**
 * Types for the Walrus SDK
 */

/**
 * Configuration options for the Walrus client
 */
export interface ClientOptions {
  /** URLs of the Walrus aggregator endpoints */
  aggregatorURLs?: string[];

  /** URLs of the Walrus publisher endpoints */
  publisherURLs?: string[];

  /** Maximum number of retry attempts for API calls */
  maxRetries?: number;

  /** Delay between retry attempts in milliseconds */
  retryDelay?: number;

  /** Maximum allowed size for uploads when content length is unknown (in bytes) */
  maxUnknownLengthUploadSize?: number;

  /** Custom fetch implementation (defaults to Bun's native fetch) */
  fetch?: typeof fetch;
}

/**
 * Supported encryption cipher suites
 */
export enum CipherSuite {
  AES256GCM = 'AES256GCM',
  AES256CBC = 'AES256CBC',
}

/**
 * Encryption options for storing and retrieving data
 */
export interface EncryptionOptions {
  /** 
   * The encryption/decryption key
   * Should be 16, 24, or 32 bytes for AES-128, AES-192, or AES-256
   */
  key: Uint8Array;

  /** The encryption suite to use: AES256GCM (default) or AES256CBC */
  suite?: CipherSuite;

  /** 
   * Initialization Vector, required for CBC mode
   * Must be 16 bytes
   */
  iv?: Uint8Array;
}

/**
 * Options for storing data
 */
export interface StoreOptions {
  /** Number of storage epochs. Determines how long the data is stored */
  epochs?: number;

  /** Optional encryption configuration. If provided, data will be encrypted before storage */
  encryption?: EncryptionOptions;

  /** Content type of the data being stored (e.g., 'application/json', 'image/png') */
  contentType?: string;
}

/**
 * Options for reading data
 */
export interface ReadOptions {
  /** 
   * Optional decryption configuration. Must be provided with the same key 
   * used for encryption to successfully decrypt the data
   */
  encryption?: EncryptionOptions;
}

/**
 * Information about a stored blob
 */
export interface BlobInfo {
  /** Unique identifier for the stored blob */
  blobId: string;

  /** The epoch at which the blob's storage will end */
  endEpoch: number;
}

/**
 * Information about a blob object on the Walrus storage
 */
export interface BlobObject {
  /** Unique identifier for the blob object */
  id: string;

  /** The epoch at which the blob was stored */
  storedEpoch: number;

  /** Unique identifier for the blob content */
  blobId: string;

  /** Size of the blob in bytes */
  size: number;

  /** Type of erasure coding used for the blob */
  erasureCodeType: string;

  /** The epoch at which the blob was certified */
  certifiedEpoch: number;

  /** Storage information for the blob */
  storage: StorageInfo;
}

/**
 * Storage information for a blob
 */
export interface StorageInfo {
  /** Unique identifier for the storage */
  id: string;

  /** The epoch at which storage started */
  startEpoch: number;

  /** The epoch at which storage will end */
  endEpoch: number;

  /** Size of the stored data in bytes */
  storageSize: number;
}

/**
 * Event information for blob certification
 */
export interface EventInfo {
  /** Transaction digest */
  txDigest: string;

  /** Event sequence */
  eventSeq: string;
}

/**
 * Response from a store operation
 */
export interface StoreResponse {
  /** Basic blob information */
  blob: BlobInfo;

  /** Information for newly created blobs */
  newlyCreated?: {
    /** The blob object information */
    blobObject: BlobObject;

    /** Size of the encoded blob in bytes */
    encodedSize: number;

    /** Cost of storing the blob */
    cost: number;
  };

  /** Information for already certified blobs */
  alreadyCertified?: {
    /** Unique identifier for the blob */
    blobId: string;

    /** Certification event information */
    event: EventInfo;

    /** The epoch at which storage will end */
    endEpoch: number;
  };
}

/**
 * Metadata information for a blob
 */
export interface BlobMetadata {
  /** Size of the blob in bytes */
  contentLength: number;

  /** MIME type of the content */
  contentType: string;

  /** Last modification timestamp */
  lastModified: string;

  /** Entity tag for cache validation */
  etag: string;
}

/**
 * Error factory for the Walrus SDK
 * @param message Error message
 * @param options Additional error options
 * @returns A new Error object with Walrus-specific properties
 */
export function createWalrusError(
  message: string,
  options?: { statusCode?: number; cause?: unknown }
): Error {
  const error = new Error(message);
  error.name = 'WalrusError';

  // Add custom properties
  Object.defineProperties(error, {
    statusCode: {
      value: options?.statusCode,
      enumerable: true,
      writable: false
    },
    cause: {
      value: options?.cause,
      enumerable: true,
      writable: false
    }
  });

  return error;
}

// For backward compatibility
export type WalrusError = Error & {
  statusCode?: number;
  cause?: unknown;
};
```

## File: src/utils/constants.ts
```typescript
/**
 * Default endpoints for the Walrus testnet
 */

/**
 * Default Walrus testnet publisher endpoints
 */
export const DEFAULT_TESTNET_PUBLISHERS = [
  "https://publisher.walrus-testnet.walrus.space",
  "https://wal-publisher-testnet.staketab.org",
  "https://walrus-testnet-publisher.bartestnet.com",
  "https://walrus-testnet-publisher.nodes.guru",
  "https://walrus-testnet-publisher.stakin-nodes.com",
  "https://testnet-publisher-walrus.kiliglab.io",
  "https://walrus-testnet-publisher.nodeinfra.com",
  "https://walrus-publisher.rubynodes.io",
  "https://walrus-testnet-publisher.brightlystake.com",
  "https://walrus-testnet-publisher.nami.cloud",
  "https://testnet.walrus-publisher.sm.xyz",
  "https://walrus-testnet-publisher.stakecraft.com",
  "https://pub.test.walrus.eosusa.io",
  "https://walrus-pub.testnet.obelisk.sh",
  "https://sui-walrus-testnet.bwarelabs.com/publisher",
  "https://walrus-testnet.chainbase.online/publisher",
];

/**
 * Default Walrus testnet aggregator endpoints
 */
export const DEFAULT_TESTNET_AGGREGATORS = [
  "https://aggregator.walrus-testnet.walrus.space",
  "https://wal-aggregator-testnet.staketab.org",
  "https://walrus-testnet-aggregator.bartestnet.com",
  "https://walrus-testnet.blockscope.net",
  "https://walrus-testnet-aggregator.nodes.guru",
  "https://walrus-cache-testnet.overclock.run",
  "https://walrus-testnet-aggregator.stakin-nodes.com",
  "https://testnet-aggregator-walrus.kiliglab.io",
  "https://walrus-cache-testnet.latitude-sui.com",
  "https://walrus-testnet-aggregator.nodeinfra.com",
  "https://walrus-testnet.stakingdefenseleague.com",
  "https://walrus-aggregator.rubynodes.io",
  "https://walrus-testnet-aggregator.brightlystake.com",
  "https://walrus-testnet-aggregator.nami.cloud",
  "https://testnet.walrus-publisher.sm.xyz",
  "https://walrus-testnet-aggregator.stakecraft.com",
];

/**
 * Default configuration constants
 */
export const DEFAULT_CONFIG = {
  /** Default maximum number of retry attempts */
  MAX_RETRIES: 5,

  /** Default delay between retry attempts in milliseconds */
  RETRY_DELAY: 500,

  /** Default maximum size for uploads when content length is unknown (5MB) */
  MAX_UNKNOWN_LENGTH_UPLOAD_SIZE: 5 * 1024 * 1024,
};
```

## File: src/utils/helpers.ts
```typescript
import type { StoreResponse } from '../types';

/**
 * Normalizes the response from store operations.
 * Ensures that blob information is consistently available in the response object.
 */
export function normalizeBlobResponse(response: StoreResponse): StoreResponse {
  // Ensure response has a blob property
  if (!response.blob) {
    response.blob = {
      blobId: '',
      endEpoch: 0,
    };
  }

  // If it's a newly created blob
  if (response.newlyCreated) {
    response.blob.blobId = response.newlyCreated.blobObject.blobId;
    response.blob.endEpoch = response.newlyCreated.blobObject.storage.endEpoch;
  }

  // If it's an already certified blob
  if (response.alreadyCertified) {
    response.blob.blobId = response.alreadyCertified.blobId;
    response.blob.endEpoch = response.alreadyCertified.endEpoch;
  }

  return response;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse error response body to extract meaningful error message
 */
export async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const json = await response.json() as Record<string, unknown>;
      return (json.error as string) || (json.message as string) || `HTTP error ${response.status}`;
    } else {
      const text = await response.text();
      return text || `HTTP error ${response.status}`;
    }
  } catch (error) {
    return `HTTP error ${response.status}`;
  }
}

/**
 * Validates if a value is a Uint8Array and has a specific length (if specified)
 */
export function validateUint8Array(
  value: unknown,
  name: string,
  requiredLength?: number
): void {
  if (!(value instanceof Uint8Array)) {
    throw new Error(`${name} must be a Uint8Array`);
  }

  if (requiredLength !== undefined && value.length !== requiredLength) {
    throw new Error(`${name} must be ${requiredLength} bytes long`);
  }
}

/**
 * Validates if a key is valid for AES encryption (16, 24, or 32 bytes)
 */
export function validateAesKey(key: Uint8Array): void {
  if (![16, 24, 32].includes(key.length)) {
    throw new Error('AES key must be 16, 24, or 32 bytes (128, 192, or 256 bits)');
  }
}

/**
 * Combines a base URL with a path, ensuring proper slash handling
 */
export function combineURLs(baseURL: string, path: string): string {
  const normalizedBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

/**
 * Gets content type based on file extension
 * @param filename The filename or path to determine content type for
 * @returns The MIME type for the file or 'application/octet-stream' if not determined
 */
export function getContentTypeFromFilename(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || '';

  const contentTypes: Record<string, string> = {
    // Text files
    'txt': 'text/plain',
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'csv': 'text/csv',
    'js': 'text/javascript',
    'ts': 'text/typescript',
    'md': 'text/markdown',

    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'ico': 'image/x-icon',

    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',

    // Video
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'avi': 'video/x-msvideo',

    // Data formats
    'json': 'application/json',
    'xml': 'application/xml',
    'yaml': 'application/yaml',
    'yml': 'application/yaml',

    // Archives
    'zip': 'application/zip',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    'rar': 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',

    // Miscellaneous
    'wasm': 'application/wasm',
    'ttf': 'font/ttf',
    'otf': 'font/otf',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
  };

  return contentTypes[ext] || 'application/octet-stream';
}
```

## File: src/index.ts
```typescript
// Export encryption module
export { createCipher, CipherSuite } from './encryption';
export type { ContentCipher, CipherOptions } from './encryption';

// Export client module
export { createWalrusClient } from './client/walrus-client';
export type { WalrusClient } from './client/walrus-client';

// Export types
export type {
  ClientOptions,
  StoreOptions,
  ReadOptions,
  StoreResponse,
  BlobMetadata,
  EncryptionOptions,
  BlobInfo,
  BlobObject,
  StorageInfo,
  EventInfo
} from './types';
export { createWalrusError } from './types';
export type { WalrusError } from './types';

// Export helper functions
export {
  validateUint8Array,
  validateAesKey,
  combineURLs,
  getContentTypeFromFilename
} from './utils/helpers';

// Export constants
export {
  DEFAULT_TESTNET_AGGREGATORS,
  DEFAULT_TESTNET_PUBLISHERS,
  DEFAULT_CONFIG
} from './utils/constants';
```

## File: .gitignore
```
# dependencies (bun install)
node_modules

# output
out
dist
*.tgz

# code coverage
coverage
*.lcov

# logs
logs
_.log
report.[0-9]_.[0-9]_.[0-9]_.[0-9]_.json

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# caches
.eslintcache
.cache
*.tsbuildinfo

# IntelliJ based IDEs
.idea

# Finder (MacOS) folder config
.DS_Store

project.md
```

## File: biome.json
```json
{
	"$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
	"vcs": {
		"enabled": false,
		"clientKind": "git",
		"useIgnoreFile": false
	},
	"files": {
		"ignoreUnknown": false,
		"ignore": []
	},
	"formatter": {
		"enabled": true,
		"indentStyle": "tab"
	},
	"organizeImports": {
		"enabled": true
	},
	"linter": {
		"enabled": true,
		"rules": {
			"recommended": true,
			"suspicious": {
				"useAwait": "error"
			}
		}
	},
	"javascript": {
		"formatter": {
			"quoteStyle": "double"
		}
	}
}
```

## File: bun.lock
```
{
  "lockfileVersion": 1,
  "workspaces": {
    "": {
      "name": "walrus-sdk",
      "dependencies": {
        "winston": "^3.17.0",
      },
      "devDependencies": {
        "@biomejs/biome": "^1.9.4",
        "@types/bun": "^1.2.5",
      },
      "peerDependencies": {
        "typescript": "^5.8.2",
      },
    },
  },
  "packages": {
    "@biomejs/biome": ["@biomejs/biome@1.9.4", "", { "optionalDependencies": { "@biomejs/cli-darwin-arm64": "1.9.4", "@biomejs/cli-darwin-x64": "1.9.4", "@biomejs/cli-linux-arm64": "1.9.4", "@biomejs/cli-linux-arm64-musl": "1.9.4", "@biomejs/cli-linux-x64": "1.9.4", "@biomejs/cli-linux-x64-musl": "1.9.4", "@biomejs/cli-win32-arm64": "1.9.4", "@biomejs/cli-win32-x64": "1.9.4" }, "bin": { "biome": "bin/biome" } }, "sha512-1rkd7G70+o9KkTn5KLmDYXihGoTaIGO9PIIN2ZB7UJxFrWw04CZHPYiMRjYsaDvVV7hP1dYNRLxSANLaBFGpog=="],

    "@biomejs/cli-darwin-arm64": ["@biomejs/cli-darwin-arm64@1.9.4", "", { "os": "darwin", "cpu": "arm64" }, "sha512-bFBsPWrNvkdKrNCYeAp+xo2HecOGPAy9WyNyB/jKnnedgzl4W4Hb9ZMzYNbf8dMCGmUdSavlYHiR01QaYR58cw=="],

    "@biomejs/cli-darwin-x64": ["@biomejs/cli-darwin-x64@1.9.4", "", { "os": "darwin", "cpu": "x64" }, "sha512-ngYBh/+bEedqkSevPVhLP4QfVPCpb+4BBe2p7Xs32dBgs7rh9nY2AIYUL6BgLw1JVXV8GlpKmb/hNiuIxfPfZg=="],

    "@biomejs/cli-linux-arm64": ["@biomejs/cli-linux-arm64@1.9.4", "", { "os": "linux", "cpu": "arm64" }, "sha512-fJIW0+LYujdjUgJJuwesP4EjIBl/N/TcOX3IvIHJQNsAqvV2CHIogsmA94BPG6jZATS4Hi+xv4SkBBQSt1N4/g=="],

    "@biomejs/cli-linux-arm64-musl": ["@biomejs/cli-linux-arm64-musl@1.9.4", "", { "os": "linux", "cpu": "arm64" }, "sha512-v665Ct9WCRjGa8+kTr0CzApU0+XXtRgwmzIf1SeKSGAv+2scAlW6JR5PMFo6FzqqZ64Po79cKODKf3/AAmECqA=="],

    "@biomejs/cli-linux-x64": ["@biomejs/cli-linux-x64@1.9.4", "", { "os": "linux", "cpu": "x64" }, "sha512-lRCJv/Vi3Vlwmbd6K+oQ0KhLHMAysN8lXoCI7XeHlxaajk06u7G+UsFSO01NAs5iYuWKmVZjmiOzJ0OJmGsMwg=="],

    "@biomejs/cli-linux-x64-musl": ["@biomejs/cli-linux-x64-musl@1.9.4", "", { "os": "linux", "cpu": "x64" }, "sha512-gEhi/jSBhZ2m6wjV530Yy8+fNqG8PAinM3oV7CyO+6c3CEh16Eizm21uHVsyVBEB6RIM8JHIl6AGYCv6Q6Q9Tg=="],

    "@biomejs/cli-win32-arm64": ["@biomejs/cli-win32-arm64@1.9.4", "", { "os": "win32", "cpu": "arm64" }, "sha512-tlbhLk+WXZmgwoIKwHIHEBZUwxml7bRJgk0X2sPyNR3S93cdRq6XulAZRQJ17FYGGzWne0fgrXBKpl7l4M87Hg=="],

    "@biomejs/cli-win32-x64": ["@biomejs/cli-win32-x64@1.9.4", "", { "os": "win32", "cpu": "x64" }, "sha512-8Y5wMhVIPaWe6jw2H+KlEm4wP/f7EW3810ZLmDlrEEy5KvBsb9ECEfu/kMWD484ijfQ8+nIi0giMgu9g1UAuuA=="],

    "@colors/colors": ["@colors/colors@1.6.0", "", {}, "sha512-Ir+AOibqzrIsL6ajt3Rz3LskB7OiMVHqltZmspbW/TJuTVuyOMirVqAkjfY6JISiLHgyNqicAC8AyHHGzNd/dA=="],

    "@dabh/diagnostics": ["@dabh/diagnostics@2.0.3", "", { "dependencies": { "colorspace": "1.1.x", "enabled": "2.0.x", "kuler": "^2.0.0" } }, "sha512-hrlQOIi7hAfzsMqlGSFyVucrx38O+j6wiGOf//H2ecvIEqYN4ADBSS2iLMh5UFyDunCNniUIPk/q3riFv45xRA=="],

    "@types/bun": ["@types/bun@1.2.5", "", { "dependencies": { "bun-types": "1.2.5" } }, "sha512-w2OZTzrZTVtbnJew1pdFmgV99H0/L+Pvw+z1P67HaR18MHOzYnTYOi6qzErhK8HyT+DB782ADVPPE92Xu2/Opg=="],

    "@types/node": ["@types/node@22.13.10", "", { "dependencies": { "undici-types": "~6.20.0" } }, "sha512-I6LPUvlRH+O6VRUqYOcMudhaIdUVWfsjnZavnsraHvpBwaEyMN29ry+0UVJhImYL16xsscu0aske3yA+uPOWfw=="],

    "@types/triple-beam": ["@types/triple-beam@1.3.5", "", {}, "sha512-6WaYesThRMCl19iryMYP7/x2OVgCtbIVflDGFpWnb9irXI3UjYE4AzmYuiUKY1AJstGijoY+MgUszMgRxIYTYw=="],

    "@types/ws": ["@types/ws@8.5.14", "", { "dependencies": { "@types/node": "*" } }, "sha512-bd/YFLW+URhBzMXurx7lWByOu+xzU9+kb3RboOteXYDfW+tr+JZa99OyNmPINEGB/ahzKrEuc8rcv4gnpJmxTw=="],

    "async": ["async@3.2.6", "", {}, "sha512-htCUDlxyyCLMgaM3xXg0C0LW2xqfuQ6p05pCEIsXuyQ+a1koYKTuBMzRNwmybfLgvJDMd0r1LTn4+E0Ti6C2AA=="],

    "bun-types": ["bun-types@1.2.5", "", { "dependencies": { "@types/node": "*", "@types/ws": "~8.5.10" } }, "sha512-3oO6LVGGRRKI4kHINx5PIdIgnLRb7l/SprhzqXapmoYkFl5m4j6EvALvbDVuuBFaamB46Ap6HCUxIXNLCGy+tg=="],

    "color": ["color@3.2.1", "", { "dependencies": { "color-convert": "^1.9.3", "color-string": "^1.6.0" } }, "sha512-aBl7dZI9ENN6fUGC7mWpMTPNHmWUSNan9tuWN6ahh5ZLNk9baLJOnSMlrQkHcrfFgz2/RigjUVAjdx36VcemKA=="],

    "color-convert": ["color-convert@1.9.3", "", { "dependencies": { "color-name": "1.1.3" } }, "sha512-QfAUtd+vFdAtFQcC8CCyYt1fYWxSqAiK2cSD6zDB8N3cpsEBAvRxp9zOGg6G/SHHJYAT88/az/IuDGALsNVbGg=="],

    "color-name": ["color-name@1.1.3", "", {}, "sha512-72fSenhMw2HZMTVHeCA9KCmpEIbzWiQsjN+BHcBbS9vr1mtt+vJjPdksIBNUmKAW8TFUDPJK5SUU3QhE9NEXDw=="],

    "color-string": ["color-string@1.9.1", "", { "dependencies": { "color-name": "^1.0.0", "simple-swizzle": "^0.2.2" } }, "sha512-shrVawQFojnZv6xM40anx4CkoDP+fZsw/ZerEMsW/pyzsRbElpsL/DBVW7q3ExxwusdNXI3lXpuhEZkzs8p5Eg=="],

    "colorspace": ["colorspace@1.1.4", "", { "dependencies": { "color": "^3.1.3", "text-hex": "1.0.x" } }, "sha512-BgvKJiuVu1igBUF2kEjRCZXol6wiiGbY5ipL/oVPwm0BL9sIpMIzM8IK7vwuxIIzOXMV3Ey5w+vxhm0rR/TN8w=="],

    "enabled": ["enabled@2.0.0", "", {}, "sha512-AKrN98kuwOzMIdAizXGI86UFBoo26CL21UM763y1h/GMSJ4/OHU9k2YlsmBpyScFo/wbLzWQJBMCW4+IO3/+OQ=="],

    "fecha": ["fecha@4.2.3", "", {}, "sha512-OP2IUU6HeYKJi3i0z4A19kHMQoLVs4Hc+DPqqxI2h/DPZHTm/vjsfC6P0b4jCMy14XizLBqvndQ+UilD7707Jw=="],

    "fn.name": ["fn.name@1.1.0", "", {}, "sha512-GRnmB5gPyJpAhTQdSZTSp9uaPSvl09KoYcMQtsB9rQoOmzs9dH6ffeccH+Z+cv6P68Hu5bC6JjRh4Ah/mHSNRw=="],

    "inherits": ["inherits@2.0.4", "", {}, "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ=="],

    "is-arrayish": ["is-arrayish@0.3.2", "", {}, "sha512-eVRqCvVlZbuw3GrM63ovNSNAeA1K16kaR/LRY/92w0zxQ5/1YzwblUX652i4Xs9RwAGjW9d9y6X88t8OaAJfWQ=="],

    "is-stream": ["is-stream@2.0.1", "", {}, "sha512-hFoiJiTl63nn+kstHGBtewWSKnQLpyb155KHheA1l39uvtO9nWIop1p3udqPcUd/xbF1VLMO4n7OI6p7RbngDg=="],

    "kuler": ["kuler@2.0.0", "", {}, "sha512-Xq9nH7KlWZmXAtodXDDRE7vs6DU1gTU8zYDHDiWLSip45Egwq3plLHzPn27NgvzL2r1LMPC1vdqh98sQxtqj4A=="],

    "logform": ["logform@2.7.0", "", { "dependencies": { "@colors/colors": "1.6.0", "@types/triple-beam": "^1.3.2", "fecha": "^4.2.0", "ms": "^2.1.1", "safe-stable-stringify": "^2.3.1", "triple-beam": "^1.3.0" } }, "sha512-TFYA4jnP7PVbmlBIfhlSe+WKxs9dklXMTEGcBCIvLhE/Tn3H6Gk1norupVW7m5Cnd4bLcr08AytbyV/xj7f/kQ=="],

    "ms": ["ms@2.1.3", "", {}, "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA=="],

    "one-time": ["one-time@1.0.0", "", { "dependencies": { "fn.name": "1.x.x" } }, "sha512-5DXOiRKwuSEcQ/l0kGCF6Q3jcADFv5tSmRaJck/OqkVFcOzutB134KRSfF0xDrL39MNnqxbHBbUUcjZIhTgb2g=="],

    "readable-stream": ["readable-stream@3.6.2", "", { "dependencies": { "inherits": "^2.0.3", "string_decoder": "^1.1.1", "util-deprecate": "^1.0.1" } }, "sha512-9u/sniCrY3D5WdsERHzHE4G2YCXqoG5FTHUiCC4SIbr6XcLZBY05ya9EKjYek9O5xOAwjGq+1JdGBAS7Q9ScoA=="],

    "safe-buffer": ["safe-buffer@5.2.1", "", {}, "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ=="],

    "safe-stable-stringify": ["safe-stable-stringify@2.5.0", "", {}, "sha512-b3rppTKm9T+PsVCBEOUR46GWI7fdOs00VKZ1+9c1EWDaDMvjQc6tUwuFyIprgGgTcWoVHSKrU8H31ZHA2e0RHA=="],

    "simple-swizzle": ["simple-swizzle@0.2.2", "", { "dependencies": { "is-arrayish": "^0.3.1" } }, "sha512-JA//kQgZtbuY83m+xT+tXJkmJncGMTFT+C+g2h2R9uxkYIrE2yy9sgmcLhCnw57/WSD+Eh3J97FPEDFnbXnDUg=="],

    "stack-trace": ["stack-trace@0.0.10", "", {}, "sha512-KGzahc7puUKkzyMt+IqAep+TVNbKP+k2Lmwhub39m1AsTSkaDutx56aDCo+HLDzf/D26BIHTJWNiTG1KAJiQCg=="],

    "string_decoder": ["string_decoder@1.3.0", "", { "dependencies": { "safe-buffer": "~5.2.0" } }, "sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA=="],

    "text-hex": ["text-hex@1.0.0", "", {}, "sha512-uuVGNWzgJ4yhRaNSiubPY7OjISw4sw4E5Uv0wbjp+OzcbmVU/rsT8ujgcXJhn9ypzsgr5vlzpPqP+MBBKcGvbg=="],

    "triple-beam": ["triple-beam@1.4.1", "", {}, "sha512-aZbgViZrg1QNcG+LULa7nhZpJTZSLm/mXnHXnbAbjmN5aSa0y7V+wvv6+4WaBtpISJzThKy+PIPxc1Nq1EJ9mg=="],

    "typescript": ["typescript@5.8.2", "", { "bin": { "tsc": "bin/tsc", "tsserver": "bin/tsserver" } }, "sha512-aJn6wq13/afZp/jT9QZmwEjDqqvSGp1VT5GVg+f/t6/oVyrgXM6BY1h9BRh/O5p3PlUPAe+WuiEZOmb/49RqoQ=="],

    "undici-types": ["undici-types@6.20.0", "", {}, "sha512-Ny6QZ2Nju20vw1SRHe3d9jVu6gJ+4e3+MMpqu7pqE5HT6WsTSlce++GQmK5UXS8mzV8DSYHrQH+Xrf2jVcuKNg=="],

    "util-deprecate": ["util-deprecate@1.0.2", "", {}, "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw=="],

    "winston": ["winston@3.17.0", "", { "dependencies": { "@colors/colors": "^1.6.0", "@dabh/diagnostics": "^2.0.2", "async": "^3.2.3", "is-stream": "^2.0.0", "logform": "^2.7.0", "one-time": "^1.0.0", "readable-stream": "^3.4.0", "safe-stable-stringify": "^2.3.1", "stack-trace": "0.0.x", "triple-beam": "^1.3.0", "winston-transport": "^4.9.0" } }, "sha512-DLiFIXYC5fMPxaRg832S6F5mJYvePtmO5G9v9IgUFPhXm9/GkXarH/TUrBAVzhTCzAj9anE/+GjrgXp/54nOgw=="],

    "winston-transport": ["winston-transport@4.9.0", "", { "dependencies": { "logform": "^2.7.0", "readable-stream": "^3.6.2", "triple-beam": "^1.3.0" } }, "sha512-8drMJ4rkgaPo1Me4zD/3WLfI/zPdA9o2IipKODunnGDcuqbHwjsbB79ylv04LCGGzU0xQ6vTznOMpQGaLhhm6A=="],
  }
}
```

## File: LICENSE
```
MIT License

Copyright (c) 2025 Walrus Typescript SDK

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## File: package.json
```json
{
  "name": "walrus-sdk",
  "version": "0.1.0",
  "description": "TypeScript SDK for the Walrus decentralized storage protocol",
  "module": "src/index.ts",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "bun build ./src/index.ts --outdir ./dist --target node",
    "start": "bun run src/index.ts",
    "test": "bun test",
    "lint": "bunx @biomejs/biome check ./src",
    "format": "bunx @biomejs/biome format --write ./src",
    "example:basic": "bun run examples/basic-storage.ts",
    "example:encrypted": "bun run examples/encrypted-storage.ts",
    "example:file": "bun run examples/file-operations.ts",
    "example:url": "bun run examples/url-operations.ts",
    "example:client": "bun run examples/custom-client.ts",
    "example:error": "bun run examples/error-handling.ts",
    "example:json": "bun run examples/json-operations.ts"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "@types/bun": "^1.2.5"
  },
  "peerDependencies": {
    "typescript": "^5.8.2"
  },
  "files": [
    "dist",
    "src",
    "examples"
  ],
  "keywords": [
    "walrus",
    "sui",
    "storage",
    "sdk",
    "decentralized",
    "bun"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "winston": "^3.17.0"
  }
}
```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    // Environment setup & latest features
    "lib": ["esnext"],
    "target": "ESNext",
    "module": "ESNext",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "allowJs": true,

    // Bundler mode
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,

    // Best practices
    "strict": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    // Some stricter flags (disabled by default)
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noPropertyAccessFromIndexSignature": false
  }
}
```
