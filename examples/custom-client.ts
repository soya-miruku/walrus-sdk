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