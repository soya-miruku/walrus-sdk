/**
 * Error Handling Example
 *
 * This example demonstrates how to handle errors when using the Walrus SDK.
 */

import { createWalrusClient, createWalrusError } from "../src";
import type { WalrusError } from "../src";

async function main() {
	// Initialize client
	const client = createWalrusClient();

	console.log("Demonstrating error handling in Walrus SDK...");

	// Example 1: Invalid blob ID
	console.log("\nExample 1: Trying to read a non-existent blob ID");
	try {
		const invalidBlobId = "non-existent-blob-id";
		console.log(`Attempting to read blob ID: ${invalidBlobId}`);

		await client.read(invalidBlobId);

		// This line will not be reached if an error is thrown
		console.log("Success (unexpected)");
	} catch (error: unknown) {
		console.log("Caught error as expected:");
		if (error instanceof Error) {
			console.log(`- Error name: ${error.name}`);
			console.log(`- Error message: ${error.message}`);

			// Check if it's a WalrusError
			if (error.name === "WalrusError") {
				const walrusError = error as WalrusError;
				console.log(`- Status code: ${walrusError.statusCode || "N/A"}`);
			}
		} else {
			console.log(`- Unknown error: ${String(error)}`);
		}
	}

	// Example 2: Invalid encryption parameters
	console.log("\nExample 2: Using invalid encryption parameters");
	try {
		// Create some data
		const data = new TextEncoder().encode("Test data");

		// Try to encrypt with an invalid key (too short)
		const invalidKey = new Uint8Array(15); // AES keys must be 16, 24, or 32 bytes

		console.log("Attempting to store with invalid encryption key (15 bytes)");
		await client.store(data, {
			epochs: 10,
			encryption: {
				key: invalidKey,
				// The encryption module will throw an error due to invalid key size
			},
		});

		// This line will not be reached if an error is thrown
		console.log("Success (unexpected)");
	} catch (error: unknown) {
		console.log("Caught error as expected:");
		if (error instanceof Error) {
			console.log(`- Error name: ${error.name}`);
			console.log(`- Error message: ${error.message}`);
		} else {
			console.log(`- Unknown error: ${String(error)}`);
		}
	}

	// Example 3: Manual error creation
	console.log("\nExample 3: Creating and throwing custom Walrus errors");
	try {
		// Simulate a validation function that throws a custom error
		function validateParameters(fileSize: number) {
			const MAX_SIZE = 1024 * 1024 * 100; // 100MB

			if (fileSize <= 0) {
				throw createWalrusError("File size must be positive");
			}

			if (fileSize > MAX_SIZE) {
				throw createWalrusError("File exceeds maximum size limit", {
					statusCode: 413, // Request Entity Too Large
				});
			}

			return true;
		}

		// Try with an invalid size
		const oversizedFile = 1024 * 1024 * 200; // 200MB
		console.log(`Validating file size: ${oversizedFile} bytes`);
		validateParameters(oversizedFile);

		// This line will not be reached if an error is thrown
		console.log("Validation successful (unexpected)");
	} catch (error: unknown) {
		console.log("Caught error as expected:");
		if (error instanceof Error) {
			console.log(`- Error name: ${error.name}`);
			console.log(`- Error message: ${error.message}`);

			// Check if it's a WalrusError
			if (error.name === "WalrusError") {
				const walrusError = error as WalrusError;
				console.log(`- Status code: ${walrusError.statusCode || "N/A"}`);
			}
		} else {
			console.log(`- Unknown error: ${String(error)}`);
		}
	}

	// Example 4: Network error simulation
	console.log("\nExample 4: Handling network errors");
	try {
		// Create a client with invalid endpoints
		const badClient = createWalrusClient({
			aggregatorURLs: ["https://invalid-endpoint.example.com"],
			publisherURLs: ["https://invalid-endpoint.example.com"],
			maxRetries: 1, // Only retry once to make the example faster
			retryDelay: 100, // Short delay
		});

		console.log("Attempting to store data with invalid endpoints");
		await badClient.store(new TextEncoder().encode("Test data"), { epochs: 5 });

		// This line will not be reached if an error is thrown
		console.log("Success (unexpected)");
	} catch (error: unknown) {
		console.log("Caught error as expected:");
		if (error instanceof Error) {
			console.log(`- Error name: ${error.name}`);
			console.log(`- Error message: ${error.message}`);
		} else {
			console.log(`- Unknown error: ${String(error)}`);
		}
	}

	console.log("\nAll error handling examples completed.");
}

// Only run if this file is being executed directly
if (import.meta.main) {
	main().catch(console.error);
}
