/**
 * Encrypted Storage Example
 *
 * This example demonstrates how to store and retrieve encrypted data
 * using the Walrus SDK with both GCM and CBC encryption modes.
 */

import { CipherSuite, createWalrusClient } from "../src";

async function main() {
	// Initialize client
	const client = createWalrusClient();

	// Create some data to encrypt and store
	const sensitiveData = new TextEncoder().encode(
		"This is sensitive information that will be encrypted",
	);

	console.log("Demonstrating AES-GCM encryption (recommended)...");

	try {
		// Generate a random encryption key (32 bytes for AES-256)
		const key = crypto.getRandomValues(new Uint8Array(32));
		console.log("Generated encryption key:", bytesToHex(key));

		// Store with GCM encryption
		const gcmResponse = await client.store(sensitiveData, {
			epochs: 10,
			encryption: {
				key,
				suite: CipherSuite.AES256GCM, // GCM mode (recommended, provides authentication)
			},
		});

		console.log(
			`Encrypted data stored with blob ID: ${gcmResponse.blob.blobId}`,
		);

		// Try to read without decryption - will get encrypted bytes
		console.log("Attempting to read without decryption...");
		const encryptedData = await client.read(gcmResponse.blob.blobId);
		console.log(`Raw encrypted data (${encryptedData.byteLength} bytes):`);
		console.log(`${bytesToHex(encryptedData).substring(0, 64)}...`);

		// Read with decryption
		console.log("Reading with proper decryption...");
		const decryptedData = await client.read(gcmResponse.blob.blobId, {
			encryption: {
				key,
				suite: CipherSuite.AES256GCM,
			},
		});

		console.log(`Decrypted data: ${new TextDecoder().decode(decryptedData)}`);

		// Demonstrate CBC mode which requires an IV
		console.log("\nDemonstrating AES-CBC encryption...");

		// Generate IV for CBC mode
		const iv = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes for AES block size
		console.log("Generated IV:", bytesToHex(iv));

		// Store with CBC encryption
		const cbcResponse = await client.store(sensitiveData, {
			epochs: 10,
			encryption: {
				key,
				suite: CipherSuite.AES256CBC,
				iv, // CBC mode requires an explicit IV
			},
		});

		console.log(
			`CBC encrypted data stored with blob ID: ${cbcResponse.blob.blobId}`,
		);

		// Read with CBC decryption (requires same key and IV)
		const cbcDecrypted = await client.read(cbcResponse.blob.blobId, {
			encryption: {
				key,
				suite: CipherSuite.AES256CBC,
				iv,
			},
		});

		console.log(
			`CBC decrypted data: ${new TextDecoder().decode(cbcDecrypted)}`,
		);
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
