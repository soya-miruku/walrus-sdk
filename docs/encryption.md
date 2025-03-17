# Encryption in Walrus SDK

The Walrus SDK provides robust client-side encryption to ensure your data remains private while stored on the decentralized network. This document details the encryption capabilities and how to use them effectively.

## Overview

All encryption in Walrus SDK happens client-side, meaning:

1. Your data is encrypted before leaving your application
2. Only encrypted data is transmitted and stored on the network
3. Encryption keys never leave your control
4. Decryption happens in your application after retrieval

This approach ensures that even if the network were compromised, your data remains secure as long as your encryption keys are safe.

## Supported Encryption Suites

The SDK supports two primary encryption methods:

### 1. AES-256-GCM (Recommended)

**Galois/Counter Mode (GCM)** provides both encryption and authentication, making it resistant to tampering.

- **Strengths**: Provides authentication and integrity checking
- **Performance**: Slightly more CPU-intensive than CBC but can be parallelized
- **Security**: Very strong and recommended for most use cases

### 2. AES-256-CBC

**Cipher Block Chaining (CBC)** is a traditional block cipher mode.

- **Strengths**: Widely supported, good performance
- **Limitations**: No built-in authentication (data can be tampered with)
- **Use Case**: When compatibility with other systems is required

## Encryption Keys

For both encryption methods, you'll need a 32-byte (256-bit) encryption key. You can:

1. Generate a random key (recommended for new data)
2. Derive a key from a password (when human-memorable keys are needed)
3. Use an existing key (when you have a secure key management system)

### Generating a Random Key

```typescript
// Generate a cryptographically secure random key
const key = crypto.getRandomValues(new Uint8Array(32));

// IMPORTANT: Store this key securely!
// If you lose this key, you cannot decrypt your data
```

### Deriving a Key from a Password

While not directly implemented in the SDK, you can use the Web Crypto API:

```typescript
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<Uint8Array> {
  // Convert password to buffer
  const passwordBuffer = new TextEncoder().encode(password);
  
  // Import key
  const baseKey = await crypto.subtle.importKey(
    'raw', 
    passwordBuffer, 
    { name: 'PBKDF2' }, 
    false, 
    ['deriveBits']
  );
  
  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000, // Higher is more secure but slower
      hash: 'SHA-256',
    },
    baseKey,
    256 // 256 bits = 32 bytes
  );
  
  return new Uint8Array(derivedBits);
}

// Example usage:
const salt = crypto.getRandomValues(new Uint8Array(16)); // Save this salt!
const key = await deriveKeyFromPassword('my-secure-password', salt);
```

## Basic Encryption Usage

Here's how to use encryption with the Walrus SDK:

```typescript
import { createWalrusClient, CipherSuite } from 'walrus-ts';

async function encryptedStorageExample() {
  // Create Walrus client
  const client = createWalrusClient();
  
  // Your data
  const data = new TextEncoder().encode('Confidential information');
  
  // Generate or load your encryption key (32 bytes)
  const key = crypto.getRandomValues(new Uint8Array(32));
  
  try {
    // Store with encryption
    const response = await client.store(data, {
      epochs: 10,
      encryption: {
        key,
        suite: CipherSuite.AES256GCM
      }
    });
    
    console.log(`Encrypted data stored with ID: ${response.blob.blobId}`);
    
    // Later, retrieve and decrypt the data
    const decrypted = await client.read(response.blob.blobId, {
      encryption: {
        key, // Must be the same key used for encryption
        suite: CipherSuite.AES256GCM // Must use the same suite
      }
    });
    
    console.log(`Decrypted: ${new TextDecoder().decode(decrypted)}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Advanced Encryption Options

### Using AES-CBC with Custom IV

When using CBC mode, you can provide your own Initialization Vector (IV):

```typescript
// Generate a 16-byte IV
const iv = crypto.getRandomValues(new Uint8Array(16));

// Store with custom IV
const response = await client.store(data, {
  epochs: 10,
  encryption: {
    key,
    suite: CipherSuite.AES256CBC,
    iv // Custom IV
  }
});

// When retrieving, you must provide the same IV
const decrypted = await client.read(response.blob.blobId, {
  encryption: {
    key,
    suite: CipherSuite.AES256CBC,
    iv // Must be exactly the same as used for encryption
  }
});
```

### Encrypting Large Files

For large files, the SDK automatically handles encryption in chunks when using streaming methods:

```typescript
import { createWalrusClient, CipherSuite } from 'walrus-ts';

async function encryptedFileExample() {
  const client = createWalrusClient();
  const key = crypto.getRandomValues(new Uint8Array(32));
  
  // Path to a file you want to encrypt and store
  const filePath = './large-document.pdf';
  
  try {
    // Store file with encryption
    const response = await client.storeFile(filePath, {
      epochs: 20,
      contentType: 'application/pdf',
      encryption: {
        key,
        suite: CipherSuite.AES256GCM
      }
    });
    
    console.log(`Encrypted file stored with ID: ${response.blob.blobId}`);
    
    // Download and decrypt to a new file
    await client.readToFile(
      response.blob.blobId, 
      './decrypted-document.pdf', 
      {
        encryption: {
          key,
          suite: CipherSuite.AES256GCM
        }
      }
    );
    
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Security Best Practices

1. **Key Management**: Securely store your encryption keys. If you lose them, you can't decrypt your data.

2. **GCM vs CBC**: Prefer AES-256-GCM over AES-256-CBC whenever possible for the added authentication.

3. **IV Handling**: If using CBC with a custom IV, never reuse the same IV with the same key.

4. **Strong Keys**: Use cryptographically secure random keys or properly derived keys from strong passwords.

5. **Metadata Protection**: Remember that while the data is encrypted, metadata about storage duration and blob size is not.

## Implementation Details

The encryption implementation in Walrus SDK uses the Web Crypto API for all cryptographic operations, ensuring:

- Hardware acceleration when available
- Standards-compliant implementations
- Protection from common cryptographic mistakes

The SDK automatically handles:
- Proper padding for CBC mode
- IV generation for GCM mode
- Authentication tag validation for GCM mode
- Streaming encryption for large files

## FAQ

**Q: Can I encrypt data with one key and decrypt with another?**
A: No, you must use the exact same key for both operations.

**Q: What happens if I lose my encryption key?**
A: Your data will be permanently inaccessible. There is no way to recover encrypted data without the original key.

**Q: Is the blob ID of encrypted data also encrypted?**
A: No. The blob ID is a hash of the encrypted data, not the original data, but the ID itself is not encrypted.

**Q: Can I change the encryption method when retrieving data?**
A: No. You must use the same encryption suite (GCM or CBC) that was used to encrypt the data.

---

For more information about Walrus SDK and its features, please refer to the [main documentation](./project.md). 