This file is a merged representation of the entire codebase, combined into a single document by Repomix.

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
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded

## Additional Info

# Directory Structure
```
docs/
  api-reference.md
  encryption.md
  getting-started.md
  README.md
examples/
  basic-storage.ts
  custom-client.ts
  encrypted-storage.ts
  error-handling.ts
  file-operations.ts
  json-operations.ts
  logging-example.ts
  README.md
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
    logger.ts
  index.ts
.gitignore
biome.json
bun.lock
LICENSE
package.json
README.md
tsconfig.json
```

# Files

## File: docs/api-reference.md
````markdown
# Walrus SDK API Reference

This document provides a comprehensive reference for all public APIs of the Walrus SDK.

## Table of Contents

- [Client Creation](#client-creation)
- [Storage Operations](#storage-operations)
- [Retrieval Operations](#retrieval-operations)
- [Metadata Operations](#metadata-operations)
- [Types](#types)
- [Errors](#errors)
- [Constants](#constants)

---

## Client Creation

### `createWalrusClient`

Creates and initializes a new Walrus client.

```typescript
function createWalrusClient(options?: WalrusClientOptions): WalrusClient
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `WalrusClientOptions` | (Optional) Configuration options for the client |

#### Returns

A new `WalrusClient` instance.

#### Example

```typescript
import { createWalrusClient } from 'walrus-sdk';

// With default options (testnet)
const client = createWalrusClient();

// With custom options
const client = createWalrusClient({
  aggregatorURLs: ['https://custom-aggregator.example.com'],
  publisherURLs: ['https://custom-publisher.example.com'],
  maxRetries: 3,
  retryDelay: 1000, // ms
});
```

### `WalrusClientOptions`

```typescript
interface WalrusClientOptions {
  // Network configuration
  aggregatorURLs?: string[];
  publisherURLs?: string[];
  
  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;
  retryPolicy?: RetryPolicy;
  
  // Upload limits
  maxUnknownLengthUploadSize?: number;
}
```

---

## Storage Operations

### `store`

Stores a byte array in the Walrus network.

```typescript
async store(data: Uint8Array, options: StoreOptions): Promise<StoreResponse>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `Uint8Array` | The data to store |
| `options` | `StoreOptions` | Storage options |

#### Returns

A `Promise` that resolves to a `StoreResponse`.

#### Example

```typescript
const data = new TextEncoder().encode('Hello, Walrus!');
const response = await client.store(data, { epochs: 10 });
```

### `storeFromStream`

Stores data from a ReadableStream in the Walrus network.

```typescript
async storeFromStream(
  stream: ReadableStream<Uint8Array>, 
  options: StoreOptions
): Promise<StoreResponse>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `stream` | `ReadableStream<Uint8Array>` | The stream to read data from |
| `options` | `StoreOptions` | Storage options |

#### Returns

A `Promise` that resolves to a `StoreResponse`.

#### Example

```typescript
const response = await client.storeFromStream(dataStream, { 
  epochs: 10,
  contentType: 'application/octet-stream' 
});
```

### `storeFromURL`

Fetches data from a URL and stores it in the Walrus network.

```typescript
async storeFromURL(url: string, options: StoreOptions): Promise<StoreResponse>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | The URL to fetch data from |
| `options` | `StoreOptions` | Storage options |

#### Returns

A `Promise` that resolves to a `StoreResponse`.

#### Example

```typescript
const response = await client.storeFromURL(
  'https://example.com/image.jpg', 
  { epochs: 10 }
);
```

### `storeFile`

Reads a file from the filesystem and stores it in the Walrus network.

```typescript
async storeFile(path: string, options: StoreOptions): Promise<StoreResponse>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | `string` | Path to the file to store |
| `options` | `StoreOptions` | Storage options |

#### Returns

A `Promise` that resolves to a `StoreResponse`.

#### Example

```typescript
const response = await client.storeFile('./document.pdf', { 
  epochs: 10,
  contentType: 'application/pdf' 
});
```

---

## Retrieval Operations

### `read`

Reads data from the Walrus network.

```typescript
async read(blobId: string, options?: ReadOptions): Promise<Uint8Array>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `blobId` | `string` | The ID of the blob to read |
| `options` | `ReadOptions` | (Optional) Read options |

#### Returns

A `Promise` that resolves to a `Uint8Array` containing the blob data.

#### Example

```typescript
const data = await client.read('bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi');
```

### `readToFile`

Reads data from the Walrus network and writes it to a file.

```typescript
async readToFile(
  blobId: string, 
  path: string, 
  options?: ReadOptions
): Promise<void>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `blobId` | `string` | The ID of the blob to read |
| `path` | `string` | Path where to save the file |
| `options` | `ReadOptions` | (Optional) Read options |

#### Returns

A `Promise` that resolves when the file has been written.

#### Example

```typescript
await client.readToFile(
  'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  './downloaded-file.jpg'
);
```

### `readToStream`

Reads data from the Walrus network as a stream.

```typescript
async readToStream(
  blobId: string, 
  options?: ReadOptions
): Promise<ReadableStream<Uint8Array>>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `blobId` | `string` | The ID of the blob to read |
| `options` | `ReadOptions` | (Optional) Read options |

#### Returns

A `Promise` that resolves to a `ReadableStream<Uint8Array>`.

#### Example

```typescript
const stream = await client.readToStream(
  'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
);
// Process the stream...
```

---

## Metadata Operations

### `head`

Gets metadata about a blob without downloading its contents.

```typescript
async head(blobId: string): Promise<HeadResponse>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `blobId` | `string` | The ID of the blob |

#### Returns

A `Promise` that resolves to a `HeadResponse`.

#### Example

```typescript
const metadata = await client.head(
  'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
);
console.log(`Content size: ${metadata.contentLength} bytes`);
```

### `getAPISpec`

Gets the OpenAPI specification for the Walrus API.

```typescript
async getAPISpec(isAggregator: boolean = true): Promise<object>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `isAggregator` | `boolean` | If true, gets the aggregator API spec; otherwise gets the publisher API spec |

#### Returns

A `Promise` that resolves to an object containing the OpenAPI specification.

#### Example

```typescript
// Get the aggregator API spec
const aggregatorSpec = await client.getAPISpec(true);

// Get the publisher API spec
const publisherSpec = await client.getAPISpec(false);
```

---

## Types

### StoreOptions

```typescript
interface StoreOptions {
  // Required: Number of epochs to store data
  epochs: number;
  
  // Optional: Content metadata
  contentType?: string;
  
  // Optional: Encryption configuration
  encryption?: EncryptionOptions;
}
```

### ReadOptions

```typescript
interface ReadOptions {
  // Optional: Encryption configuration (must match store options)
  encryption?: EncryptionOptions;
  
  // Optional: Request cancellation
  signal?: AbortSignal;
}
```

### EncryptionOptions

```typescript
interface EncryptionOptions {
  // Required: 32-byte encryption key
  key: Uint8Array;
  
  // Required: Encryption algorithm
  suite: CipherSuite;
  
  // Optional: Initialization vector for CBC mode
  iv?: Uint8Array;
}
```

### StoreResponse

```typescript
interface StoreResponse {
  blob: {
    blobId: string;      // Unique identifier
    startEpoch: number;  // When storage begins
    endEpoch: number;    // When storage expires
  };
  uploadUrl?: string;    // Direct upload URL (if applicable)
}
```

### HeadResponse

```typescript
interface HeadResponse {
  contentLength: number;  // Size in bytes
  contentType: string;    // MIME type
  startEpoch: number;     // When storage began
  endEpoch: number;       // When storage expires
  createdAt: string;      // ISO timestamp
}
```

### CipherSuite

```typescript
enum CipherSuite {
  AES256GCM = 'aes-256-gcm',
  AES256CBC = 'aes-256-cbc'
}
```

### RetryPolicy

```typescript
enum RetryPolicy {
  FIXED_DELAY = 'fixed',
  EXPONENTIAL_BACKOFF = 'exponential'
}
```

---

## Errors

The SDK defines several error types for specific failure scenarios:

### WalrusError

Base error class for all Walrus SDK errors.

```typescript
class WalrusError extends Error {
  code: string;
  status?: number;
}
```

### NetworkError

Thrown when network requests fail.

```typescript
class NetworkError extends WalrusError {
  // Additional network-specific information
}
```

### ValidationError

Thrown when validation fails for inputs.

```typescript
class ValidationError extends WalrusError {
  // Details about which validation failed
}
```

### AuthenticationError

Thrown when authentication fails.

```typescript
class AuthenticationError extends WalrusError {
  // Authentication failure details
}
```

### NotFoundError

Thrown when a blob is not found.

```typescript
class NotFoundError extends WalrusError {
  // Contains the blobId that wasn't found
}
```

### EncryptionError

Thrown when encryption or decryption fails.

```typescript
class EncryptionError extends WalrusError {
  // Contains details about the encryption failure
}
```

---

## Constants

### DEFAULT_AGGREGATOR_URLS

Default URLs for aggregator nodes.

```typescript
const DEFAULT_AGGREGATOR_URLS: string[]
```

### DEFAULT_PUBLISHER_URLS

Default URLs for publisher nodes.

```typescript
const DEFAULT_PUBLISHER_URLS: string[]
```

### DEFAULT_MAX_RETRIES

Default number of retry attempts.

```typescript
const DEFAULT_MAX_RETRIES: number // 3
```

### DEFAULT_RETRY_DELAY

Default delay between retries in milliseconds.

```typescript
const DEFAULT_RETRY_DELAY: number // 1000
```

### DEFAULT_MAX_UNKNOWN_LENGTH_UPLOAD_SIZE

Default maximum size for uploads with unknown length in bytes.

```typescript
const DEFAULT_MAX_UNKNOWN_LENGTH_UPLOAD_SIZE: number // 10 * 1024 * 1024 (10MB)
```

### DEFAULT_CIPHER_SUITE

Default encryption cipher suite.

```typescript
const DEFAULT_CIPHER_SUITE: CipherSuite // CipherSuite.AES256GCM
```
````

## File: docs/encryption.md
````markdown
# Encryption in Walrus SDK

The Walrus SDK provides robust client-side encryption to ensure your data remains private while stored on the decentralized network. This document details the encryption capabilities and how to use them effectively.

## Overview

All encryption in Walrus SDK happens client-side, meaning:

1. Your data is encrypted before leaving your application
2. Only encrypted data is transmitted and stored on the network
3. Encryption keys never leave your control
4. Decryption happens in your application after retrieval

This approach ensures that even if the network were compromised, your data remains secure as long as your encryption keys are safe.

## Supported Encryption Suites

The SDK supports two primary encryption methods:

### 1. AES-256-GCM (Recommended)

**Galois/Counter Mode (GCM)** provides both encryption and authentication, making it resistant to tampering.

- **Strengths**: Provides authentication and integrity checking
- **Performance**: Slightly more CPU-intensive than CBC but can be parallelized
- **Security**: Very strong and recommended for most use cases

### 2. AES-256-CBC

**Cipher Block Chaining (CBC)** is a traditional block cipher mode.

- **Strengths**: Widely supported, good performance
- **Limitations**: No built-in authentication (data can be tampered with)
- **Use Case**: When compatibility with other systems is required

## Encryption Keys

For both encryption methods, you'll need a 32-byte (256-bit) encryption key. You can:

1. Generate a random key (recommended for new data)
2. Derive a key from a password (when human-memorable keys are needed)
3. Use an existing key (when you have a secure key management system)

### Generating a Random Key

```typescript
// Generate a cryptographically secure random key
const key = crypto.getRandomValues(new Uint8Array(32));

// IMPORTANT: Store this key securely!
// If you lose this key, you cannot decrypt your data
```

### Deriving a Key from a Password

While not directly implemented in the SDK, you can use the Web Crypto API:

```typescript
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<Uint8Array> {
  // Convert password to buffer
  const passwordBuffer = new TextEncoder().encode(password);
  
  // Import key
  const baseKey = await crypto.subtle.importKey(
    'raw', 
    passwordBuffer, 
    { name: 'PBKDF2' }, 
    false, 
    ['deriveBits']
  );
  
  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000, // Higher is more secure but slower
      hash: 'SHA-256',
    },
    baseKey,
    256 // 256 bits = 32 bytes
  );
  
  return new Uint8Array(derivedBits);
}

// Example usage:
const salt = crypto.getRandomValues(new Uint8Array(16)); // Save this salt!
const key = await deriveKeyFromPassword('my-secure-password', salt);
```

## Basic Encryption Usage

Here's how to use encryption with the Walrus SDK:

```typescript
import { createWalrusClient, CipherSuite } from 'walrus-sdk';

async function encryptedStorageExample() {
  // Create Walrus client
  const client = createWalrusClient();
  
  // Your data
  const data = new TextEncoder().encode('Confidential information');
  
  // Generate or load your encryption key (32 bytes)
  const key = crypto.getRandomValues(new Uint8Array(32));
  
  try {
    // Store with encryption
    const response = await client.store(data, {
      epochs: 10,
      encryption: {
        key,
        suite: CipherSuite.AES256GCM
      }
    });
    
    console.log(`Encrypted data stored with ID: ${response.blob.blobId}`);
    
    // Later, retrieve and decrypt the data
    const decrypted = await client.read(response.blob.blobId, {
      encryption: {
        key, // Must be the same key used for encryption
        suite: CipherSuite.AES256GCM // Must use the same suite
      }
    });
    
    console.log(`Decrypted: ${new TextDecoder().decode(decrypted)}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Advanced Encryption Options

### Using AES-CBC with Custom IV

When using CBC mode, you can provide your own Initialization Vector (IV):

```typescript
// Generate a 16-byte IV
const iv = crypto.getRandomValues(new Uint8Array(16));

// Store with custom IV
const response = await client.store(data, {
  epochs: 10,
  encryption: {
    key,
    suite: CipherSuite.AES256CBC,
    iv // Custom IV
  }
});

// When retrieving, you must provide the same IV
const decrypted = await client.read(response.blob.blobId, {
  encryption: {
    key,
    suite: CipherSuite.AES256CBC,
    iv // Must be exactly the same as used for encryption
  }
});
```

### Encrypting Large Files

For large files, the SDK automatically handles encryption in chunks when using streaming methods:

```typescript
import { createWalrusClient, CipherSuite } from 'walrus-sdk';

async function encryptedFileExample() {
  const client = createWalrusClient();
  const key = crypto.getRandomValues(new Uint8Array(32));
  
  // Path to a file you want to encrypt and store
  const filePath = './large-document.pdf';
  
  try {
    // Store file with encryption
    const response = await client.storeFile(filePath, {
      epochs: 20,
      contentType: 'application/pdf',
      encryption: {
        key,
        suite: CipherSuite.AES256GCM
      }
    });
    
    console.log(`Encrypted file stored with ID: ${response.blob.blobId}`);
    
    // Download and decrypt to a new file
    await client.readToFile(
      response.blob.blobId, 
      './decrypted-document.pdf', 
      {
        encryption: {
          key,
          suite: CipherSuite.AES256GCM
        }
      }
    );
    
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Security Best Practices

1. **Key Management**: Securely store your encryption keys. If you lose them, you can't decrypt your data.

2. **GCM vs CBC**: Prefer AES-256-GCM over AES-256-CBC whenever possible for the added authentication.

3. **IV Handling**: If using CBC with a custom IV, never reuse the same IV with the same key.

4. **Strong Keys**: Use cryptographically secure random keys or properly derived keys from strong passwords.

5. **Metadata Protection**: Remember that while the data is encrypted, metadata about storage duration and blob size is not.

## Implementation Details

The encryption implementation in Walrus SDK uses the Web Crypto API for all cryptographic operations, ensuring:

- Hardware acceleration when available
- Standards-compliant implementations
- Protection from common cryptographic mistakes

The SDK automatically handles:
- Proper padding for CBC mode
- IV generation for GCM mode
- Authentication tag validation for GCM mode
- Streaming encryption for large files

## FAQ

**Q: Can I encrypt data with one key and decrypt with another?**
A: No, you must use the exact same key for both operations.

**Q: What happens if I lose my encryption key?**
A: Your data will be permanently inaccessible. There is no way to recover encrypted data without the original key.

**Q: Is the blob ID of encrypted data also encrypted?**
A: No. The blob ID is a hash of the encrypted data, not the original data, but the ID itself is not encrypted.

**Q: Can I change the encryption method when retrieving data?**
A: No. You must use the same encryption suite (GCM or CBC) that was used to encrypt the data.

---

For more information about Walrus SDK and its features, please refer to the [main documentation](./project.md).
````

## File: docs/getting-started.md
````markdown
# Getting Started with Walrus SDK

This guide will help you quickly get up and running with the Walrus SDK.

## Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js ≥ 16
- Basic knowledge of TypeScript/JavaScript
- A project where you want to implement decentralized storage

## Installation

Add the Walrus SDK to your project using your preferred package manager:

```bash
# Using Bun (recommended)
bun add walrus-sdk

# Using npm
npm install walrus-sdk

# Using yarn
yarn add walrus-sdk

# Using pnpm
pnpm add walrus-sdk
```

## Basic Usage

Here's a simple example to store and retrieve data:

```typescript
import { createWalrusClient } from 'walrus-sdk';

async function basicExample() {
  // Create a Walrus client with default settings
  const client = createWalrusClient();
  
  // Example data to store
  const data = new TextEncoder().encode('Hello, decentralized world!');
  
  try {
    // Store data for 10 epochs (blockchain time periods)
    const response = await client.store(data, { epochs: 10 });
    
    console.log('Storage successful!');
    console.log(`Blob ID: ${response.blob.blobId}`);
    console.log(`Available until epoch: ${response.blob.endEpoch}`);
    
    // Retrieve the stored data
    const retrievedData = await client.read(response.blob.blobId);
    
    // Convert bytes back to text
    const text = new TextDecoder().decode(retrievedData);
    console.log(`Retrieved data: ${text}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
basicExample();
```

## Working with Files

You can easily store and retrieve files from the filesystem:

```typescript
import { createWalrusClient } from 'walrus-sdk';
import { join } from 'path';

async function fileExample() {
  const client = createWalrusClient();
  
  // Path to a file you want to store
  const filePath = './example.jpg';
  
  try {
    // Store the file for 20 epochs
    const response = await client.storeFile(filePath, { 
      epochs: 20,
      contentType: 'image/jpeg' // Optional but recommended
    });
    
    console.log(`File stored with blob ID: ${response.blob.blobId}`);
    
    // Download path
    const downloadPath = './downloaded-example.jpg';
    
    // Download the file directly to disk
    await client.readToFile(response.blob.blobId, downloadPath);
    
    console.log(`File downloaded to: ${downloadPath}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
fileExample();
```

## Working with Encryption

For sensitive data, you can enable client-side encryption:

```typescript
import { createWalrusClient, CipherSuite } from 'walrus-sdk';

async function encryptionExample() {
  const client = createWalrusClient();
  
  // Data to encrypt and store
  const data = new TextEncoder().encode('This is sensitive information');
  
  // Generate a 32-byte (256-bit) encryption key
  // IMPORTANT: In production, you should securely store this key!
  const key = crypto.getRandomValues(new Uint8Array(32));
  
  try {
    // Store with encryption
    const response = await client.store(data, {
      epochs: 10,
      encryption: {
        key,
        suite: CipherSuite.AES256GCM // Recommended for authentication
      }
    });
    
    console.log(`Encrypted data stored with blob ID: ${response.blob.blobId}`);
    
    // To decrypt, you must provide the same key and suite
    const decrypted = await client.read(response.blob.blobId, {
      encryption: {
        key,
        suite: CipherSuite.AES256GCM
      }
    });
    
    console.log(`Decrypted: ${new TextDecoder().decode(decrypted)}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
encryptionExample();
```

## Custom Configuration

You can customize the client with various options:

```typescript
import { createWalrusClient, RetryPolicy } from 'walrus-sdk';

// Create a client with custom configuration
const client = createWalrusClient({
  // Custom endpoints (for production use)
  aggregatorURLs: ['https://your-aggregator.example.com'],
  publisherURLs: ['https://your-publisher.example.com'],
  
  // Custom retry settings
  maxRetries: 5,
  retryDelay: 500, // ms
  retryPolicy: RetryPolicy.EXPONENTIAL_BACKOFF,
  
  // Limits
  maxUnknownLengthUploadSize: 50 * 1024 * 1024, // 50MB
});
```

## Next Steps

Now that you've got the basics, you might want to explore:

- [Core Features](./core-features.md) - Detailed overview of all SDK capabilities
- [API Reference](./api-reference.md) - Complete API documentation
- [Examples](../examples/) - Full example scripts demonstrating various features

For help or questions, please refer to the project's GitHub repository or the official Walrus documentation.
````

## File: docs/README.md
````markdown
# Walrus SDK Documentation

Welcome to the Walrus SDK documentation. This directory contains comprehensive documentation for the Walrus SDK, a TypeScript library for interacting with the Walrus decentralized storage protocol on Sui.

## Documentation Index

### Core Documentation

- [Project Overview](./project.md) - Complete overview of the SDK
- [Getting Started](./getting-started.md) - Quick start guide
- [API Reference](./api-reference.md) - Detailed API documentation
- [Encryption Guide](./encryption.md) - Using encryption features

### Example Code

For working examples, see the [examples directory](../examples/) which includes:

- Basic storage operations
- Encrypted storage
- File operations
- URL operations
- Custom client configuration
- Error handling

## Additional Resources

- [Walrus Protocol Documentation](https://docs.walrus.site/)
- [Sui Documentation](https://docs.sui.io/)

## Support

If you need help or have questions about the Walrus SDK, please:

1. Check the documentation for answers
2. Look at the examples for guidance
3. File an issue in the GitHub repository

## Contributing

Contributions to the Walrus SDK are welcome! Please see the [Contributing Guide](./project.md#contributing) for details on how to get involved.

## License

The Walrus SDK is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.
````

## File: examples/basic-storage.ts
````typescript
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
````

## File: examples/custom-client.ts
````typescript
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
````

## File: examples/encrypted-storage.ts
````typescript
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
````

## File: examples/error-handling.ts
````typescript
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
````

## File: examples/file-operations.ts
````typescript
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
````

## File: examples/json-operations.ts
````typescript
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
````

## File: examples/logging-example.ts
````typescript
/**
 * Logging Example
 * 
 * This example demonstrates how to use and configure the logger
 * within the Walrus SDK.
 */

import { createWalrusClient, LogLevel, configureLogger } from "../src";

// Define types for our data
interface TestData {
  name: string;
  description: string;
  features: string[];
  timestamp: string;
}

interface LargeData {
  items: Array<{
    id: number;
    value: string;
    metadata: {
      created: string;
      tags: string[];
    };
  }>;
}

async function main() {
  // Configure the global logger to show all debug messages and track timing
  configureLogger({
    level: LogLevel.DEBUG,
    trackTiming: true,
    // Only log performance timings that take more than 5ms
    minTimingThreshold: 5,
  });

  console.log("Demonstrating logger configuration and performance tracking in Walrus SDK");

  // Create a client with custom logger settings (these take precedence over the global config)
  const client = createWalrusClient({
    logger: {
      // Only show warning and error messages
      level: LogLevel.WARN,
      // Customize the console format
      consoleFormat: "simple",
      // Still track timing
      trackTiming: true,
      // Higher threshold for timing logs to reduce noise
      minTimingThreshold: 100,
    },
  });

  try {
    // Create some JSON data to store
    const jsonData: TestData = {
      name: "Walrus Protocol",
      description: "Decentralized storage with performance tracking",
      features: ["Fast", "Secure", "Decentralized", "Performance Monitoring"],
      timestamp: new Date().toISOString(),
    };

    console.log("\nStoring JSON data to measure performance...");

    // Store some data - timing will be tracked automatically
    const storeResponse = await client.storeJSON(jsonData, { epochs: 5 });
    const blobId = storeResponse.blob.blobId;

    console.log(`Data stored with blob ID: ${blobId}`);

    // Get metadata - timing will be tracked
    const metadata = await client.head(blobId);
    console.log(`Content length: ${metadata.contentLength} bytes`);

    // Read back the data - timing will be tracked
    console.log("\nRetrieving data to measure read performance...");
    const retrievedData = await client.readJSON<TestData>(blobId);
    console.log(`Data retrieved successfully: ${retrievedData.name}`);

    // Demonstrate a large operation to see performance timing
    console.log("\nPerforming a larger operation to demonstrate timing thresholds...");
    // Create a large array
    const largeData: LargeData = {
      items: Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        value: `Item ${i}`,
        metadata: {
          created: new Date().toISOString(),
          tags: ["test", "performance", `tag${i % 10}`],
        },
      })),
    };

    // Store and retrieve the large data
    const largeResponse = await client.storeJSON(largeData, { epochs: 5 });
    console.log(`Large data stored with blob ID: ${largeResponse.blob.blobId}`);

    // This operation should definitely cross the timing threshold
    const largeRetrieved = await client.readJSON<LargeData>(largeResponse.blob.blobId);
    console.log(`Large data retrieved, contains ${largeRetrieved.items.length} items`);

  } catch (error) {
    console.error("Error:", error);
  }
}

// Only run if this file is being executed directly
if (import.meta.main) {
  main().catch(console.error);
}
````

## File: examples/README.md
````markdown
# Walrus SDK Examples

This directory contains a collection of example scripts that demonstrate how to use the Walrus SDK.

## Running the Examples

You can run these examples using Bun:

```bash
# From the root of the project
bun run examples/basic-storage.ts
```

## Example Descriptions

### Basic Usage

- **[basic-storage.ts](./basic-storage.ts)**: Demonstrates basic data storage and retrieval operations.
- **[encrypted-storage.ts](./encrypted-storage.ts)**: Shows how to encrypt and decrypt data with both GCM and CBC modes.
- **[file-operations.ts](./file-operations.ts)**: Examples of working with files and streams.
- **[url-operations.ts](./url-operations.ts)**: Demonstrates storing content from remote URLs.

### Advanced Usage

- **[custom-client.ts](./custom-client.ts)**: Shows how to configure the Walrus client with custom options.
- **[error-handling.ts](./error-handling.ts)**: Examples of proper error handling techniques.

## Prerequisites

Make sure you have Bun installed and have set up the SDK properly. These examples assume you're running against the Walrus testnet, which has rate limits. For production applications, you should use dedicated endpoints.

## Note on Encryption

When using encryption, make sure to securely store your encryption keys. The examples generate random keys for demonstration purposes, but in a real application, you should implement proper key management.

## Additional Features (Coming Soon)

In future updates, we plan to add examples for:

- Sui blockchain integration for verification
- WAL token operations
- Walrus Sites deployment

## Need Help?

If you encounter any issues or have questions, please open an issue in the GitHub repository.
````

## File: examples/url-operations.ts
````typescript
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
````

## File: src/client/walrus-client.ts
````typescript
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
````

## File: src/encryption/cbc.ts
````typescript
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
````

## File: src/encryption/gcm.ts
````typescript
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
````

## File: src/encryption/index.ts
````typescript
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
````

## File: src/encryption/interfaces.ts
````typescript
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
````

## File: src/tests/encryption.test.ts
````typescript
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
````

## File: src/types/index.ts
````typescript
/**
 * Types for the Walrus SDK
 */

import type { LoggerOptions } from '../utils/logger';

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

  /** Logger configuration options */
  logger?: LoggerOptions;
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
````

## File: src/utils/constants.ts
````typescript
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
````

## File: src/utils/helpers.ts
````typescript
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
````

## File: src/utils/logger.ts
````typescript
import winston, { format, transports } from 'winston';

/**
 * Log levels for the Walrus SDK
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Options for configuring the logger
 */
export interface LoggerOptions {
  /** The minimum log level to display */
  level?: LogLevel;
  /** Whether to enable console output */
  console?: boolean;
  /** The format to use for console output */
  consoleFormat?: 'simple' | 'json';
  /** Whether to track and log function execution times */
  trackTiming?: boolean;
  /** Minimum time in milliseconds to log for performance tracking */
  minTimingThreshold?: number;
}

/**
 * A wrapper around Winston logger with timing capabilities
 */
class WalrusLogger {
  private logger: winston.Logger;
  private timers: Map<string, number> = new Map();
  private trackTiming: boolean;
  private minTimingThreshold: number;

  /**
   * Create a new logger instance
   * @param options Configuration options
   */
  constructor(options: LoggerOptions = {}) {
    const {
      level = LogLevel.INFO,
      console = true,
      consoleFormat = 'simple',
      trackTiming = true,
      minTimingThreshold = 0,
    } = options;

    // Define transports
    const logTransports: winston.transport[] = [];

    // Add console transport if enabled
    if (console) {
      const formatOptions = consoleFormat === 'json'
        ? format.combine(format.timestamp(), format.json())
        : format.combine(
          format.colorize(),
          format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length
              ? ` ${JSON.stringify(meta)}`
              : '';
            return `${timestamp} [${level}]: ${message}${metaStr}`;
          })
        );

      logTransports.push(
        new transports.Console({
          format: formatOptions,
        })
      );
    }

    // Create the logger
    this.logger = winston.createLogger({
      level,
      levels: winston.config.npm.levels,
      transports: logTransports,
    });

    this.trackTiming = trackTiming;
    this.minTimingThreshold = minTimingThreshold;
  }

  /**
   * Log an error message
   * @param message Message to log
   * @param meta Additional metadata
   */
  error(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.error(message, meta);
  }

  /**
   * Log a warning message
   * @param message Message to log
   * @param meta Additional metadata
   */
  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log an informational message
   * @param message Message to log
   * @param meta Additional metadata
   */
  info(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.info(message, meta);
  }

  /**
   * Log a debug message
   * @param message Message to log
   * @param meta Additional metadata
   */
  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.debug(message, meta);
  }

  /**
   * Start timing a function
   * @param label Label to identify the timer
   */
  startTimer(label: string): void {
    if (!this.trackTiming) return;
    this.timers.set(label, performance.now());
  }

  /**
   * End timing a function and log the result
   * @param label Label to identify the timer
   * @param meta Additional metadata
   */
  endTimer(label: string, meta: Record<string, unknown> = {}): number {
    if (!this.trackTiming || !this.timers.has(label)) return 0;

    const startTime = this.timers.get(label) as number;
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Only log if duration exceeds minimum threshold
    if (duration >= this.minTimingThreshold) {
      this.debug(`Execution time for ${label}: ${duration.toFixed(2)}ms`, {
        ...meta,
        duration,
        operation: label,
      });
    }

    this.timers.delete(label);
    return duration;
  }

  /**
   * Time the execution of an async function
   * @param label Label to identify the timer
   * @param fn The function to time
   * @param meta Additional metadata
   * @returns The result of the function
   */
  async timeAsync<T>(
    label: string,
    fn: () => Promise<T>,
    meta: Record<string, unknown> = {}
  ): Promise<T> {
    this.startTimer(label);
    try {
      const result = await fn();
      this.endTimer(label, meta);
      return result;
    } catch (error) {
      this.endTimer(label, { ...meta, error });
      throw error;
    }
  }

  /**
   * Time the execution of a synchronous function
   * @param label Label to identify the timer
   * @param fn The function to time
   * @param meta Additional metadata
   * @returns The result of the function
   */
  timeSync<T>(
    label: string,
    fn: () => T,
    meta: Record<string, unknown> = {}
  ): T {
    this.startTimer(label);
    try {
      const result = fn();
      this.endTimer(label, meta);
      return result;
    } catch (error) {
      this.endTimer(label, { ...meta, error });
      throw error;
    }
  }
}

/**
 * Create a logger with the specified options
 * @param options Logger configuration options
 * @returns A configured logger instance
 */
export function createLogger(options: LoggerOptions = {}): WalrusLogger {
  return new WalrusLogger(options);
}

// Default logger instance with default settings
let defaultLogger = createLogger();

/**
 * Configure the default logger
 * @param options Logger configuration options
 */
export function configureLogger(options: LoggerOptions): void {
  defaultLogger = createLogger(options);
}

// Export the default logger instance
export default defaultLogger;
````

## File: src/index.ts
````typescript
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

// Export logger
export { default as logger, createLogger, configureLogger, LogLevel } from './utils/logger';
export type { LoggerOptions } from './utils/logger';
````

## File: .gitignore
````
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
````

## File: biome.json
````json
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
````

## File: bun.lock
````
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
````

## File: LICENSE
````
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
````

## File: package.json
````json
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
    "example:json": "bun run examples/json-operations.ts",
    "example:logging": "bun run examples/logging-example.ts"
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
````

## File: README.md
````markdown
<div align="center">
  <h1>🌊 Walrus SDK</h1>
  
  <p>A TypeScript SDK for the <a href="https://docs.walrus.site/">Walrus</a> decentralized storage protocol built on <a href="https://sui.io/">Sui</a></p>

  <p>
    <a href="https://www.npmjs.com/package/walrus-sdk"><img src="https://img.shields.io/npm/v/walrus-sdk.svg?style=flat-square" alt="npm version"></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License: MIT"></a>
    <a href="https://docs.walrus.site/"><img src="https://img.shields.io/badge/Docs-Walrus-0096FF?style=flat-square" alt="Docs: Walrus"></a>
    <a href="https://bun.sh"><img src="https://img.shields.io/badge/Runtime-Bun-F9F1E1?style=flat-square" alt="Runtime: Bun"></a>
  </p>
</div>

---

## 📋 Table of Contents

- [What is Walrus?](#-what-is-walrus)
- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Use Cases](#-use-cases)
- [Future Roadmap](#-future-roadmap)
- [Development](#-development)
- [About Walrus](#-about-walrus)
- [Disclaimer](#-disclaimer)
- [License](#-license)

## 🌊 What is Walrus?

Walrus is a decentralized storage and data availability protocol designed specifically for large binary files ("blobs"). Built on the [Sui](https://sui.io/) blockchain, Walrus provides:

- **🛡️ Robust, affordable storage** for unstructured content
- **🔄 High availability** even in the presence of Byzantine faults
- **⛓️ Integration with the Sui blockchain** for coordination, attestation, and payments
- **🔒 Client-side encryption** for storing sensitive data

## ✨ Features

<table>
  <tr>
    <td>
      <h3>🗃️ Core Storage Operations</h3>
      <ul>
        <li>Store data from multiple sources (byte arrays, files, streams, URLs)</li>
        <li>Retrieve data in multiple formats</li>
        <li>Get metadata without downloading content</li>
      </ul>
    </td>
    <td>
      <h3>🔐 Advanced Encryption</h3>
      <ul>
        <li>AES-256-GCM encryption (recommended, provides authentication)</li>
        <li>AES-256-CBC encryption (with custom IV support)</li>
        <li>Stream-based encryption and decryption</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <h3>📂 File & Stream Handling</h3>
      <ul>
        <li>Upload files directly from disk</li>
        <li>Download blobs to files</li>
        <li>Stream-based uploads and downloads</li>
      </ul>
    </td>
    <td>
      <h3>⚠️ Error Handling</h3>
      <ul>
        <li>Detailed error types</li>
        <li>Automatic retries with configurable policy</li>
        <li>Comprehensive error reporting</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <h3>⚙️ Customization</h3>
      <ul>
        <li>Custom endpoints for aggregators and publishers</li>
        <li>Configurable retry mechanisms</li>
        <li>Upload size limits and more</li>
      </ul>
    </td>
  </tr>
</table>

## 📦 Installation

Install the SDK using your favorite package manager:

```bash
# Using Bun (recommended)
bun add walrus-sdk

# Using npm
npm install walrus-sdk

# Using yarn
yarn add walrus-sdk

# Using pnpm
pnpm add walrus-sdk
```

## 🚀 Quick Start

```typescript
import { createWalrusClient } from 'walrus-sdk';

// Create client with default testnet endpoints
const client = createWalrusClient();

// Store data
const data = new TextEncoder().encode('Hello, Walrus!');
const response = await client.store(data, { epochs: 10 });

console.log(`Data stored with blob ID: ${response.blob.blobId}`);

// Retrieve data
const retrievedData = await client.read(response.blob.blobId);
console.log(`Retrieved: ${new TextDecoder().decode(retrievedData)}`);
```

## 📖 API Reference

### Client Creation

```typescript
import { createWalrusClient } from 'walrus-sdk';

// With default options
const client = createWalrusClient();

// With custom options
const client = createWalrusClient({
  aggregatorURLs: ['https://custom-aggregator.example.com'],
  publisherURLs: ['https://custom-publisher.example.com'],
  maxRetries: 3,
  retryDelay: 1000, // ms
  maxUnknownLengthUploadSize: 10 * 1024 * 1024, // 10MB
});
```

### Core Methods

<table>
  <tr>
    <th align="left">Method</th>
    <th align="left">Description</th>
  </tr>
  <tr>
    <td><code>store(data, options)</code></td>
    <td>Store data (Uint8Array)</td>
  </tr>
  <tr>
    <td><code>storeFromStream(stream, options)</code></td>
    <td>Store data from a ReadableStream</td>
  </tr>
  <tr>
    <td><code>storeFromURL(url, options)</code></td>
    <td>Store content from a URL</td>
  </tr>
  <tr>
    <td><code>storeFile(path, options)</code></td>
    <td>Store a file from disk</td>
  </tr>
  <tr>
    <td><code>read(blobId, options)</code></td>
    <td>Read data as Uint8Array</td>
  </tr>
  <tr>
    <td><code>readToFile(blobId, path, options)</code></td>
    <td>Save blob to a file</td>
  </tr>
  <tr>
    <td><code>readToStream(blobId, options)</code></td>
    <td>Get blob as ReadableStream</td>
  </tr>
  <tr>
    <td><code>head(blobId)</code></td>
    <td>Get blob metadata</td>
  </tr>
  <tr>
    <td><code>getAPISpec(isAggregator)</code></td>
    <td>Get API specification</td>
  </tr>
</table>

### Encryption

```typescript
// Generate a random encryption key
const key = crypto.getRandomValues(new Uint8Array(32)); // AES-256

// Store with GCM encryption (recommended)
const response = await client.store(data, {
  epochs: 10,
  encryption: {
    key,
    suite: CipherSuite.AES256GCM,
  }
});

// Retrieve and decrypt data
const decrypted = await client.read(response.blob.blobId, {
  encryption: {
    key,
    suite: CipherSuite.AES256GCM,
  }
});
```

## 📚 Examples

The SDK includes several example scripts demonstrating various features:

```bash
# Run examples using the provided scripts
bun run example:basic      # Basic storage operations
bun run example:encrypted  # Data encryption/decryption
bun run example:file       # File and stream operations
bun run example:url        # Working with remote URLs
bun run example:client     # Custom client configuration
bun run example:error      # Error handling techniques
```

See the [examples directory](./examples) for more detailed examples and documentation.

## 🔍 Use Cases

<div>
  <table>
    <tr>
      <td align="center">
        <h3>🖼️</h3>
        <b>NFT and dApp Media Storage</b>
        <p>Store images, sounds, videos, and other assets for web3 applications</p>
      </td>
      <td align="center">
        <h3>🔒</h3>
        <b>Encrypted Data</b>
        <p>Store sensitive information with client-side encryption</p>
      </td>
      <td align="center">
        <h3>🤖</h3>
        <b>AI Models and Datasets</b>
        <p>Store model weights, training data, and outputs</p>
      </td>
    </tr>
    <tr>
      <td align="center">
        <h3>📜</h3>
        <b>Blockchain History</b>
        <p>Archive historical blockchain data</p>
      </td>
      <td align="center">
        <h3>⚡</h3>
        <b>Layer 2 Data Availability</b>
        <p>Certify data availability for L2 solutions</p>
      </td>
      <td align="center">
        <h3>🌐</h3>
        <b>Decentralized Websites</b>
        <p>Host complete web experiences including HTML, CSS, JS, and media</p>
      </td>
    </tr>
    <tr>
      <td align="center" colspan="3">
        <h3>🔑</h3>
        <b>Subscription Models</b>
        <p>Store encrypted content and manage access via decryption keys</p>
      </td>
    </tr>
  </table>
</div>

## 🔮 Future Roadmap

The SDK will continue to evolve with these planned features:

- **⛓️ Sui Blockchain Integration:** Verify blob availability and certification on-chain
- **💰 WAL Token Support:** Purchase storage and stake tokens directly through the SDK
- **🌐 Walrus Sites:** Deploy decentralized websites with simplified workflows

## 💻 Development

```bash
# Clone the repository
git clone https://github.com/yourusername/walrus-sdk.git
cd walrus-sdk

# Install dependencies
bun install

# Build the SDK
bun run build

# Run tests
bun test
```

## ℹ️ About Walrus

Walrus is a decentralized storage protocol with the following key features:

- **📦 Storage and Retrieval:** Write and read blobs with high availability
- **💸 Cost Efficiency:** Advanced erasure coding keeps storage costs low
- **⛓️ Sui Blockchain Integration:** Uses Sui for coordination and payment
- **💰 Tokenomics:** WAL token for staking and storage payments
- **🔌 Flexible Access:** CLI, SDKs, and HTTP interfaces

## ⚠️ Disclaimer

> **The current Testnet release of Walrus is a preview** intended to showcase the technology and solicit feedback. All transactions use Testnet WAL and SUI which have no value. The store state can be wiped at any point without warning. Do not rely on the Testnet for production purposes.

> **All blobs stored in Walrus are public and discoverable by all.** Do not use Walrus to store secrets or private data without client-side encryption.

## 📄 License

This project is licensed under the [MIT License](./LICENSE) - see the [LICENSE](./LICENSE) file for details.
````

## File: tsconfig.json
````json
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
````
