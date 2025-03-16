<div align="center">
  <img src="docs/walrus-icon.svg" alt="Walrus Logo" width="120" />
  <h1>Walrus Typescript SDK</h1>
  
  <p>A TypeScript SDK for the <a href="https://docs.walrus.site/">Walrus</a> decentralized storage protocol built on <a href="https://sui.io/">Sui</a></p>

  <p>
    <a href="https://www.npmjs.com/package/walrus-sdk"><img src="https://img.shields.io/npm/v/walrus-sdk.svg?style=flat-square" alt="npm version"></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License: MIT"></a>
    <a href="https://docs.walrus.site/"><img src="https://img.shields.io/badge/Docs-Walrus-0096FF?style=flat-square" alt="Docs: Walrus"></a>
    <a href="https://bun.sh"><img src="https://img.shields.io/badge/Runtime-Bun-F9F1E1?style=flat-square" alt="Runtime: Bun"></a>
  </p>
</div>

---

## 📋 Table of Contents

- [What is Walrus?](#-what-is-walrus)
- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Use Cases](#-use-cases)
- [Future Roadmap](#-future-roadmap)
- [Development](#-development)
- [About Walrus](#-about-walrus)
- [Disclaimer](#-disclaimer)
- [License](#-license)

## 🌊 What is Walrus?

Walrus is a decentralized storage and data availability protocol designed specifically for large binary files ("blobs"). Built on the [Sui](https://sui.io/) blockchain, Walrus provides:

- **🛡️ Robust, affordable storage** for unstructured content
- **🔄 High availability** even in the presence of Byzantine faults
- **⛓️ Integration with the Sui blockchain** for coordination, attestation, and payments
- **🔒 Client-side encryption** for storing sensitive data

## ✨ Features

<table>
  <tr>
    <td>
      <h3>🗃️ Core Storage Operations</h3>
      <ul>
        <li>Store data from multiple sources (byte arrays, files, streams, URLs)</li>
        <li>Retrieve data in multiple formats</li>
        <li>Get metadata without downloading content</li>
      </ul>
    </td>
    <td>
      <h3>🔐 Advanced Encryption</h3>
      <ul>
        <li>AES-256-GCM encryption (recommended, provides authentication)</li>
        <li>AES-256-CBC encryption (with custom IV support)</li>
        <li>Stream-based encryption and decryption</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <h3>📂 File & Stream Handling</h3>
      <ul>
        <li>Upload files directly from disk</li>
        <li>Download blobs to files</li>
        <li>Stream-based uploads and downloads</li>
      </ul>
    </td>
    <td>
      <h3>⚠️ Error Handling</h3>
      <ul>
        <li>Detailed error types</li>
        <li>Automatic retries with configurable policy</li>
        <li>Comprehensive error reporting</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <h3>⚙️ Customization</h3>
      <ul>
        <li>Custom endpoints for aggregators and publishers</li>
        <li>Configurable retry mechanisms</li>
        <li>Upload size limits and more</li>
      </ul>
    </td>
  </tr>
</table>

## 📦 Installation

Install the SDK using your favorite package manager:

```bash
# Using Bun (recommended)
bun add walrus-sdk

# Using npm
npm install walrus-sdk

# Using yarn
yarn add walrus-sdk

# Using pnpm
pnpm add walrus-sdk
```

## 🚀 Quick Start

```typescript
import { createWalrusClient } from 'walrus-sdk';

// Create client with default testnet endpoints
const client = createWalrusClient();

// Store data
const data = new TextEncoder().encode('Hello, Walrus!');
const response = await client.store(data, { epochs: 10 });

console.log(`Data stored with blob ID: ${response.blob.blobId}`);

// Retrieve data
const retrievedData = await client.read(response.blob.blobId);
console.log(`Retrieved: ${new TextDecoder().decode(retrievedData)}`);
```

## 📖 API Reference

### Client Creation

```typescript
import { createWalrusClient } from 'walrus-sdk';

// With default options
const client = createWalrusClient();

// With custom options
const client = createWalrusClient({
  aggregatorURLs: ['https://custom-aggregator.example.com'],
  publisherURLs: ['https://custom-publisher.example.com'],
  maxRetries: 3,
  retryDelay: 1000, // ms
  maxUnknownLengthUploadSize: 10 * 1024 * 1024, // 10MB
});
```

### Core Methods

<table>
  <tr>
    <th align="left">Method</th>
    <th align="left">Description</th>
  </tr>
  <tr>
    <td><code>store(data, options)</code></td>
    <td>Store data (Uint8Array)</td>
  </tr>
  <tr>
    <td><code>storeFromStream(stream, options)</code></td>
    <td>Store data from a ReadableStream</td>
  </tr>
  <tr>
    <td><code>storeFromURL(url, options)</code></td>
    <td>Store content from a URL</td>
  </tr>
  <tr>
    <td><code>storeFile(path, options)</code></td>
    <td>Store a file from disk</td>
  </tr>
  <tr>
    <td><code>storeJSON(data, options)</code></td>
    <td>Store JSON data with proper serialization</td>
  </tr>
  <tr>
    <td><code>read(blobId, options)</code></td>
    <td>Read data as Uint8Array</td>
  </tr>
  <tr>
    <td><code>readJSON(blobId, options)</code></td>
    <td>Read and parse JSON data</td>
  </tr>
  <tr>
    <td><code>readToFile(blobId, path, options)</code></td>
    <td>Save blob to a file</td>
  </tr>
  <tr>
    <td><code>readToStream(blobId, options)</code></td>
    <td>Get blob as ReadableStream</td>
  </tr>
  <tr>
    <td><code>head(blobId)</code></td>
    <td>Get blob metadata</td>
  </tr>
  <tr>
    <td><code>getAPISpec(isAggregator)</code></td>
    <td>Get API specification</td>
  </tr>
</table>

### Encryption

```typescript
// Generate a random encryption key
const key = crypto.getRandomValues(new Uint8Array(32)); // AES-256

// Store with GCM encryption (recommended)
const response = await client.store(data, {
  epochs: 10,
  encryption: {
    key,
    suite: CipherSuite.AES256GCM,
  }
});

// Retrieve and decrypt data
const decrypted = await client.read(response.blob.blobId, {
  encryption: {
    key,
    suite: CipherSuite.AES256GCM,
  }
});
```

## 📚 Examples

The SDK includes several example scripts demonstrating various features:

```bash
# Run examples using the provided scripts
bun run example:basic      # Basic storage operations
bun run example:encrypted  # Data encryption/decryption
bun run example:file       # File and stream operations
bun run example:url        # Working with remote URLs
bun run example:client     # Custom client configuration
bun run example:error      # Error handling techniques
bun run example:json       # JSON data operations
bun run example:logging    # Logging configuration
```

### Working with JSON Data

```typescript
import { createWalrusClient } from 'walrus-sdk';

// Create client
const client = createWalrusClient();

// Store JSON data
const jsonData = {
  name: "Walrus Protocol",
  description: "Decentralized storage on Sui",
  features: ["Fast", "Secure", "Decentralized"],
  metrics: {
    reliability: 99.9,
    nodes: 42,
    storageCapacity: "1PB",
  }
};

// Store the data
const response = await client.storeJSON(jsonData, { epochs: 10 });
console.log(`JSON data stored with blob ID: ${response.blob.blobId}`);

// Retrieve the data with type safety
interface WalrusConfig {
  name: string;
  features: string[];
  metrics: {
    reliability: number;
    nodes: number;
    storageCapacity: string;
  };
}

// Retrieve with type checking
const typedData = await client.readJSON<WalrusConfig>(response.blob.blobId);
console.log(`Name: ${typedData.name}`);
console.log(`Features: ${typedData.features.join(", ")}`);
console.log(`Reliability: ${typedData.metrics.reliability}%`);

// Store sensitive data with encryption
const key = crypto.getRandomValues(new Uint8Array(32));
const encryptedResponse = await client.storeJSON(
  { apiKey: "secret-key-12345", accessToken: "sensitive-token" },
  {
    epochs: 5,
    encryption: { key }
  }
);

// Read with decryption
const decryptedData = await client.readJSON(encryptedResponse.blob.blobId, {
  encryption: { key }
});
```

See the [examples directory](./examples) for more detailed examples and documentation.

## 🔍 Use Cases

<div>
  <table>
    <tr>
      <td align="center">
        <h3>🖼️</h3>
        <b>NFT and dApp Media Storage</b>
        <p>Store images, sounds, videos, and other assets for web3 applications</p>
      </td>
      <td align="center">
        <h3>🔒</h3>
        <b>Encrypted Data</b>
        <p>Store sensitive information with client-side encryption</p>
      </td>
      <td align="center">
        <h3>🤖</h3>
        <b>AI Models and Datasets</b>
        <p>Store model weights, training data, and outputs</p>
      </td>
    </tr>
    <tr>
      <td align="center">
        <h3>📜</h3>
        <b>Blockchain History</b>
        <p>Archive historical blockchain data</p>
      </td>
      <td align="center">
        <h3>⚡</h3>
        <b>Layer 2 Data Availability</b>
        <p>Certify data availability for L2 solutions</p>
      </td>
      <td align="center">
        <h3>🌐</h3>
        <b>Decentralized Websites</b>
        <p>Host complete web experiences including HTML, CSS, JS, and media</p>
      </td>
    </tr>
    <tr>
      <td align="center" colspan="3">
        <h3>🔑</h3>
        <b>Subscription Models</b>
        <p>Store encrypted content and manage access via decryption keys</p>
      </td>
    </tr>
  </table>
</div>

## 🔮 Future Roadmap

The SDK will continue to evolve with these planned features:

- **⛓️ Sui Blockchain Integration:** Verify blob availability and certification on-chain
- **💰 WAL Token Support:** Purchase storage and stake tokens directly through the SDK
- **🌐 Walrus Sites:** Deploy decentralized websites with simplified workflows

## 💻 Development

```bash
# Clone the repository
git clone https://github.com/soya-miruku/walrus-sdk.git
cd walrus-sdk

# Install dependencies
bun install

# Build the SDK
bun run build

# Run tests
bun test
```

## ℹ️ About Walrus

Walrus is a decentralized storage protocol with the following key features:

- **📦 Storage and Retrieval:** Write and read blobs with high availability
- **💸 Cost Efficiency:** Advanced erasure coding keeps storage costs low
- **⛓️ Sui Blockchain Integration:** Uses Sui for coordination and payment
- **💰 Tokenomics:** WAL token for staking and storage payments
- **🔌 Flexible Access:** CLI, SDKs, and HTTP interfaces

## ⚠️ Disclaimer

> **The current Testnet release of Walrus is a preview** intended to showcase the technology and solicit feedback. All transactions use Testnet WAL and SUI which have no value. The store state can be wiped at any point without warning. Do not rely on the Testnet for production purposes.

> **All blobs stored in Walrus are public and discoverable by all.** Do not use Walrus to store secrets or private data without client-side encryption.

## 📄 License

This project is licensed under the [MIT License](./LICENSE) - see the [LICENSE](./LICENSE) file for details.
