# Walrus SDK Examples

This directory contains a collection of example scripts that demonstrate how to use the Walrus SDK.

## Running the Examples

You can run these examples using Bun:

```bash
# From the root of the project
bun run examples/basic-storage.ts
```

## Example Descriptions

### Basic Usage

- **[basic-storage.ts](./basic-storage.ts)**: Demonstrates basic data storage and retrieval operations.
- **[encrypted-storage.ts](./encrypted-storage.ts)**: Shows how to encrypt and decrypt data with both GCM and CBC modes.
- **[file-operations.ts](./file-operations.ts)**: Examples of working with files and streams.
- **[url-operations.ts](./url-operations.ts)**: Demonstrates storing content from remote URLs.

### Advanced Usage

- **[custom-client.ts](./custom-client.ts)**: Shows how to configure the Walrus client with custom options.
- **[error-handling.ts](./error-handling.ts)**: Examples of proper error handling techniques.

## Prerequisites

Make sure you have Bun installed and have set up the SDK properly. These examples assume you're running against the Walrus testnet, which has rate limits. For production applications, you should use dedicated endpoints.

## Note on Encryption

When using encryption, make sure to securely store your encryption keys. The examples generate random keys for demonstration purposes, but in a real application, you should implement proper key management.

## Additional Features (Coming Soon)

In future updates, we plan to add examples for:

- Sui blockchain integration for verification
- WAL token operations
- Walrus Sites deployment

## Need Help?

If you encounter any issues or have questions, please open an issue in the GitHub repository. 