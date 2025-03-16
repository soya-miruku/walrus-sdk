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