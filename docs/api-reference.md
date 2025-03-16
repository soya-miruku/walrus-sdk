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