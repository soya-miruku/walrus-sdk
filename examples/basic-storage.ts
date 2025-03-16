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