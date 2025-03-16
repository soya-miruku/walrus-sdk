/**
 * URL Operations Example
 * 
 * This example demonstrates how to store content from remote URLs
 * using the Walrus SDK.
 */

import { createWalrusClient } from '../src';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

async function main() {
  // Initialize client
  const client = createWalrusClient();

  try {
    // Create a temporary directory for downloads
    const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'walrus-url-'));
    console.log(`Created temporary directory: ${tempDir}`);

    // URLs to download and store
    const urls = [
      'https://raw.githubusercontent.com/MystenLabs/sui/main/README.md',
      'https://avatars.githubusercontent.com/u/110161859', // MystenLabs GitHub avatar
    ];

    for (const [index, url] of urls.entries()) {
      console.log(`\nExample ${index + 1}: Storing content from URL: ${url}`);

      // Store from URL
      console.log('Fetching and storing content...');
      const storeResponse = await client.storeFromURL(url, { epochs: 10 });
      const blobId = storeResponse.blob.blobId;
      console.log(`Content stored with blob ID: ${blobId}`);

      // Get metadata
      const metadata = await client.head(blobId);
      console.log(`Content size: ${metadata.contentLength} bytes`);
      console.log(`Content type: ${metadata.contentType}`);

      // Download to file
      const extension = getExtensionFromContentType(metadata.contentType || '');
      const downloadPath = path.join(tempDir, `download-${index + 1}${extension}`);
      console.log(`Saving to: ${downloadPath}`);
      await client.readToFile(blobId, downloadPath);

      // Get file stats
      const stats = await fs.promises.stat(downloadPath);
      console.log(`File saved successfully (${stats.size} bytes)`);
    }

    // Clean up
    console.log('\nCleaning up temporary files...');
    await fs.promises.rm(tempDir, { recursive: true });
    console.log('Cleanup complete');

  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Helper function to guess a file extension from a MIME type
 */
function getExtensionFromContentType(contentType: string): string {
  const extensions: Record<string, string> = {
    'text/plain': '.txt',
    'text/html': '.html',
    'text/css': '.css',
    'text/javascript': '.js',
    'application/json': '.json',
    'application/xml': '.xml',
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'application/octet-stream': '.bin',
    'application/markdown': '.md',
    'text/markdown': '.md',
  };

  // Get the base content type without parameters
  const baseType = contentType.split(';')[0]?.trim();

  return extensions[baseType || ''] || '';
}

// Only run if this file is being executed directly
if (import.meta.main) {
  main().catch(console.error);
} 