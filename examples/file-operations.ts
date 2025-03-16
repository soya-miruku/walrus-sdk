/**
 * File Operations Example
 *
 * This example demonstrates how to work with files and streams
 * using the Walrus SDK.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createWalrusClient } from "../src";

async function main() {
	// Initialize client
	const client = createWalrusClient();

	try {
		// Create a temporary directory for our example files
		const tempDir = await fs.promises.mkdtemp(
			path.join(os.tmpdir(), "walrus-"),
		);
		console.log(`Created temporary directory: ${tempDir}`);

		// Create a test file
		const testFilePath = path.join(tempDir, "test-file.txt");
		const fileContent = "This is a test file for Walrus SDK file operations.";
		await fs.promises.writeFile(testFilePath, fileContent);
		console.log(`Created test file at: ${testFilePath}`);

		// Store the file
		console.log("Storing file to Walrus...");
		const storeResponse = await client.storeFile(testFilePath, { epochs: 10 });
		const blobId = storeResponse.blob.blobId;
		console.log(`File stored with blob ID: ${blobId}`);

		// Read the blob metadata
		const metadata = await client.head(blobId);
		console.log(`File size: ${metadata.contentLength} bytes`);
		console.log(`Content type: ${metadata.contentType}`);

		// Save the blob to a new file
		const downloadPath = path.join(tempDir, "downloaded-file.txt");
		console.log(`Saving blob to: ${downloadPath}`);
		await client.readToFile(blobId, downloadPath);

		// Verify the downloaded content
		const downloadedContent = await fs.promises.readFile(downloadPath, "utf-8");
		console.log(`Downloaded content: "${downloadedContent}"`);
		console.log(
			`Content matches original: ${downloadedContent === fileContent}`,
		);

		// Demonstrate stream operations
		console.log("\nDemonstrating stream operations...");

		// Create a larger file for stream demo
		const largeFilePath = path.join(tempDir, "large-file.txt");
		const largeContent = "A".repeat(1024 * 10); // 10KB of data
		await fs.promises.writeFile(largeFilePath, largeContent);

		// Create a read stream
		const readStream = fs.createReadStream(largeFilePath);
		const readableStream = Bun.file(largeFilePath).stream();

		// Store from stream
		console.log("Storing from stream...");
		const streamResponse = await client.storeFromStream(readableStream, {
			epochs: 10,
		});
		const streamBlobId = streamResponse.blob.blobId;
		console.log(`Stream stored with blob ID: ${streamBlobId}`);

		// Create a write stream for downloading
		const streamDownloadPath = path.join(tempDir, "stream-downloaded.txt");
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
			chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0),
		);

		let offset = 0;
		for (const chunk of chunks) {
			combinedData.set(chunk, offset);
			offset += chunk.byteLength;
		}

		await fs.promises.writeFile(streamDownloadPath, combinedData);

		// Verify the streamed content
		const streamedContent = await fs.promises.readFile(
			streamDownloadPath,
			"utf-8",
		);
		console.log(`Streamed content length: ${streamedContent.length} bytes`);
		console.log(
			`Streamed content matches original: ${streamedContent === largeContent}`,
		);

		// Clean up temporary files
		console.log("\nCleaning up temporary files...");
		await fs.promises.rm(tempDir, { recursive: true });
		console.log("Cleanup complete");
	} catch (error) {
		console.error("Error:", error);
	}
}

// Only run if this file is being executed directly
if (import.meta.main) {
	main().catch(console.error);
}
