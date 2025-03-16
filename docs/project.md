# 🌊 Walrus SDK

A TypeScript SDK for the [Walrus](https://docs.walrus.site/) decentralized storage protocol built on [Sui](https://sui.io/).

## Table of Contents

- [Introduction](#introduction)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Core Features](#core-features)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [Development](#development)
- [Contributing](#contributing)

## Introduction

Walrus is a decentralized storage and data availability protocol specifically designed for storing large binary files ("blobs") in a robust, secure, and distributed way. Built on the Sui blockchain, it combines the benefits of decentralized technology with practical data storage solutions.

The Walrus SDK provides a simple, intuitive interface for developers to interact with the Walrus protocol, enabling applications to:

- Store data reliably in a decentralized network
- Retrieve data efficiently when needed
- Leverage client-side encryption for sensitive information
- Handle various file formats and data sources

### Key Benefits

- **Decentralization**: Data is stored across multiple nodes, enhancing reliability and availability
- **Blockchain Integration**: Leverages Sui for secure payment and coordination
- **Client-side Encryption**: Ensures privacy while maintaining full control over encryption keys
- **Multiple Input/Output Methods**: Works with files, byte arrays, streams, and URLs
- **Developer-friendly**: Simple API with comprehensive error handling and retries

## Architecture

The Walrus SDK follows a clean, modular architecture:

### High-Level Components

```
┌─────────────────┐     ┌───────────────┐     ┌────────────────┐
│                 │     │               │     │                │
│    User Code    │────▶│  Walrus SDK   │────▶│ Walrus Network │
│                 │     │               │     │                │
└─────────────────┘     └───────────────┘     └────────────────┘
```

### Core Modules

- **Client**: Main interface for storage operations
- **Encryption**: Handles data encryption/decryption (AES-256-GCM/CBC)
- **Utils**: Helper functions and constants
- **Types**: TypeScript type definitions

### Network Interaction

The SDK communicates with two types of Walrus network nodes:

1. **Aggregators**: Coordinate storage requests and provide read access
2. **Publishers**: Store actual data blobs

## Getting Started

### Installation

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

### Basic Usage

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

## Core Features

### Basic Storage Operations

The SDK provides several methods for storing and retrieving data:

- **Store**: Upload data from various sources
  - `store(data, options)`: From Uint8Array
  - `storeFromStream(stream, options)`: From ReadableStream
  - `storeFromURL(url, options)`: From a remote URL
  - `storeFile(path, options)`: From a file on disk

- **Retrieve**: Download data in various formats
  - `read(blobId, options)`: As Uint8Array
  - `readToFile(blobId, path, options)`: To a file on disk
  - `readToStream(blobId, options)`: As a ReadableStream

- **Metadata**: Get information without downloading
  - `head(blobId)`: Get blob metadata (size, content type, etc.)

### Encryption

The SDK supports two encryption modes:

1. **AES-256-GCM** (recommended): Provides both encryption and authentication
2. **AES-256-CBC**: Traditional encryption with custom IV support

Example with encryption:

```typescript
import { createWalrusClient, CipherSuite } from 'walrus-sdk';

// Generate a random encryption key
const key = crypto.getRandomValues(new Uint8Array(32)); // AES-256

// Create client
const client = createWalrusClient();

// Store with encryption
const response = await client.store(data, {
  epochs: 10,
  encryption: {
    key,
    suite: CipherSuite.AES256GCM, // or AES256CBC
  }
});

// Retrieve and decrypt data
const decrypted = await client.read(response.blob.blobId, {
  encryption: {
    key,
    suite: CipherSuite.AES256GCM, // must match encryption suite used
  }
});
```

### Error Handling

The SDK provides robust error handling with automatic retries:

```typescript
import { createWalrusClient, WalrusError, RetryPolicy } from 'walrus-sdk';

// Create client with custom retry policy
const client = createWalrusClient({
  maxRetries: 5,
  retryDelay: 500, // ms
  retryPolicy: RetryPolicy.EXPONENTIAL_BACKOFF,
});

try {
  const response = await client.store(data, { epochs: 10 });
} catch (error) {
  if (error instanceof WalrusError) {
    console.error(`Walrus error: ${error.message} (code: ${error.code})`);
  } else {
    console.error(`Unexpected error: ${error}`);
  }
}
```

## API Reference

### Client Creation

```typescript
createWalrusClient(options?: {
  // Network configuration
  aggregatorURLs?: string[]; // Default: testnet aggregators
  publisherURLs?: string[];  // Default: testnet publishers
  
  // Retry configuration
  maxRetries?: number;       // Default: 3
  retryDelay?: number;       // Default: 1000ms
  retryPolicy?: RetryPolicy; // Default: EXPONENTIAL_BACKOFF
  
  // Upload limits
  maxUnknownLengthUploadSize?: number; // Default: 10MB
})
```

### Storage Options

```typescript
interface StoreOptions {
  // Required: Number of epochs to store data
  epochs: number;
  
  // Optional: Content metadata
  contentType?: string;
  
  // Optional: Encryption configuration
  encryption?: {
    key: Uint8Array; // 32 bytes for AES-256
    suite: CipherSuite;
    iv?: Uint8Array; // Optional for CBC mode
  };
}
```

### Read Options

```typescript
interface ReadOptions {
  // Optional: Encryption configuration (must match store options)
  encryption?: {
    key: Uint8Array;
    suite: CipherSuite;
    iv?: Uint8Array; // Required for CBC if used during encryption
  };
  
  // Optional: Request configuration
  signal?: AbortSignal; // For cancellation
}
```

### Return Types

```typescript
// Store response
interface StoreResponse {
  blob: {
    blobId: string;   // Unique identifier
    startEpoch: number; // When storage begins
    endEpoch: number;   // When storage expires
  };
  uploadUrl?: string; // Direct upload URL (if applicable)
}

// Head response
interface HeadResponse {
  contentLength: number;
  contentType: string;
  startEpoch: number;
  endEpoch: number;
  createdAt: string;
}
```

## Advanced Usage

### Custom Endpoints

For production use, you may want to specify custom endpoints:

```typescript
const client = createWalrusClient({
  aggregatorURLs: [
    'https://aggregator1.example.com',
    'https://aggregator2.example.com'
  ],
  publisherURLs: [
    'https://publisher1.example.com',
    'https://publisher2.example.com'
  ]
});
```

### Streaming Large Files

For large files, streaming is recommended:

```typescript
// Upload a large file
const fileStream = Bun.file('/path/to/large-file.bin').stream();
const response = await client.storeFromStream(fileStream, { 
  epochs: 10,
  contentType: 'application/octet-stream'
});

// Download a large file as a stream
const downloadStream = await client.readToStream(response.blob.blobId);
const writer = Bun.file('/path/to/save-file.bin').writer();
await downloadStream.pipeTo(writer);
```

### Handling Timeouts and Cancellation

For long-running operations, you may want to implement timeouts:

```typescript
// Create an AbortController
const controller = new AbortController();
const { signal } = controller;

// Set a timeout
const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds

try {
  // Pass the signal to the operation
  const data = await client.read(blobId, { signal });
  clearTimeout(timeout); // Clear timeout if successful
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Operation was aborted due to timeout');
  } else {
    console.error('Operation failed:', error);
  }
}
```

## Examples

The SDK includes several examples demonstrating different features:

- **Basic Storage**: Simple store and retrieve operations
- **Encrypted Storage**: Working with encrypted data
- **File Operations**: Working with files and streams
- **URL Operations**: Storing content from remote URLs
- **Custom Client**: Configuring the client with custom options
- **Error Handling**: Handling errors and retries

Run examples with:

```bash
# Using Bun
bun run example:basic
bun run example:encrypted
bun run example:file
bun run example:url
bun run example:client
bun run example:error
```

## Development

### Building the SDK

```bash
# Install dependencies
bun install

# Run tests
bun test

# Lint code
bun run lint

# Format code
bun run format

# Build for production
bun run build
```

### Project Structure

```
walrus-sdk/
├── dist/           # Compiled output
├── docs/           # Documentation
├── examples/       # Example scripts
├── src/
│   ├── client/     # Client implementation
│   ├── encryption/ # Encryption modules
│   ├── tests/      # Test suite
│   ├── types/      # TypeScript types
│   ├── utils/      # Utility functions
│   └── index.ts    # Entry point
├── biome.json      # Biome configuration
├── package.json    # Package metadata
└── tsconfig.json   # TypeScript configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's style guidelines and passes all tests.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details. 