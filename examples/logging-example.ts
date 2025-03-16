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