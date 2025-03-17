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
bun add walrus-ts

# Using npm
npm install walrus-ts

# Using yarn
yarn add walrus-ts

# Using pnpm
pnpm add walrus-ts
```

## Basic Usage

Here's a simple example to store and retrieve data:

```typescript
import { createWalrusClient } from 'walrus-ts';

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
import { createWalrusClient } from 'walrus-ts';
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
import { createWalrusClient, CipherSuite } from 'walrus-ts';

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
import { createWalrusClient, RetryPolicy } from 'walrus-ts';

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