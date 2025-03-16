import type { ContentCipher, CipherOptions } from './interfaces';
import { validateAesKey, validateUint8Array } from '../utils/helpers';
import { createWalrusError } from '../types';

// Magic bytes to identify encrypted content (WAL)
const MAGIC_BYTES = new Uint8Array([0x57, 0x41, 0x4C]);

// AES-CBC parameters
const IV_LENGTH = 16; // 128 bits for CBC mode
const CBC_BLOCK_SIZE = 16; // 128 bits

/**
 * Creates a ContentCipher implementation using AES-CBC
 * @param options Cipher options containing key and IV
 * @returns An implementation of the ContentCipher interface
 */
export function createCBCCipher(options: CipherOptions): ContentCipher {
  // Validate options
  validateAesKey(options.key);

  if (!options.iv) {
    throw createWalrusError('Initialization vector (IV) is required for CBC mode');
  }

  validateUint8Array(options.iv, 'IV', IV_LENGTH);

  // Private state
  const keyData = options.key;
  const iv = options.iv;
  const subtle = crypto.subtle;
  let key: CryptoKey | null = null;

  /**
   * Imports the raw key bytes into a CryptoKey object
   */
  const importKey = async (): Promise<CryptoKey> => {
    if (key) return key;

    try {
      key = await subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-CBC' },
        false, // not extractable
        ['encrypt', 'decrypt']
      );
      return key;
    } catch (error) {
      throw createWalrusError('Failed to import key for AES-CBC', { cause: error });
    }
  };

  /**
   * Ensures the key is available or initializes it
   */
  const ensureKey = async (): Promise<CryptoKey> => {
    if (!key) {
      key = await importKey();
    }

    if (!key) {
      throw createWalrusError('Failed to initialize encryption key');
    }

    return key;
  };

  /**
   * Adds PKCS#7 padding to the data
   */
  const padData = (data: Uint8Array): Uint8Array => {
    const paddingLength = CBC_BLOCK_SIZE - (data.length % CBC_BLOCK_SIZE);
    const padded = new Uint8Array(data.length + paddingLength);
    padded.set(data);

    // PKCS#7 padding - fill with the padding length value
    padded.fill(paddingLength, data.length);

    return padded;
  };

  /**
   * Removes PKCS#7 padding from the data
   */
  const unpadData = (data: Uint8Array): Uint8Array => {
    if (data.length === 0) {
      return data;
    }

    // Get the padding length from the last byte
    const paddingLength = data[data.length - 1] as number;

    // Validate the padding length
    if (paddingLength <= 0 || paddingLength > CBC_BLOCK_SIZE) {
      throw createWalrusError('Invalid padding length');
    }

    // Validate padding (all padding bytes should be the same)
    for (let i = data.length - paddingLength; i < data.length; i++) {
      if (data[i] !== paddingLength) {
        throw createWalrusError('Invalid padding');
      }
    }

    // Return the data without padding
    return data.slice(0, data.length - paddingLength);
  };

  /**
   * Reads all data from a stream and combines it into a single Uint8Array
   */
  const readStreamToUint8Array = async (src: ReadableStream<Uint8Array>): Promise<Uint8Array> => {
    const reader = src.getReader();
    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        totalLength += value.byteLength;
      }
    } finally {
      reader.releaseLock();
    }

    // Combine all chunks
    const data = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return data;
  };

  /**
   * Encrypts a Uint8Array using AES-CBC
   */
  const encrypt = async (data: Uint8Array): Promise<Uint8Array> => {
    const cryptoKey = await ensureKey();

    // Pad the data to a multiple of the block size
    const padded = padData(data);

    try {
      // Encrypt the data
      const ciphertext = new Uint8Array(
        await subtle.encrypt(
          { name: 'AES-CBC', iv },
          cryptoKey,
          padded
        )
      );

      // Combine magic bytes, IV, and ciphertext
      const result = new Uint8Array(MAGIC_BYTES.length + IV_LENGTH + ciphertext.length);
      result.set(MAGIC_BYTES, 0);
      result.set(iv, MAGIC_BYTES.length);
      result.set(ciphertext, MAGIC_BYTES.length + IV_LENGTH);

      return result;
    } catch (error) {
      throw createWalrusError('Encryption failed', { cause: error });
    }
  };

  /**
   * Decrypts a Uint8Array using AES-CBC
   */
  const decrypt = async (data: Uint8Array): Promise<Uint8Array> => {
    const cryptoKey = await ensureKey();

    // Check for magic bytes
    if (data.length < MAGIC_BYTES.length + IV_LENGTH) {
      throw createWalrusError('Invalid encrypted data: too short');
    }

    for (let i = 0; i < MAGIC_BYTES.length; i++) {
      if (data[i] !== MAGIC_BYTES[i]) {
        throw createWalrusError('Invalid encrypted data: invalid magic bytes');
      }
    }

    // Extract IV and ciphertext
    const extractedIv = data.slice(MAGIC_BYTES.length, MAGIC_BYTES.length + IV_LENGTH);
    const ciphertext = data.slice(MAGIC_BYTES.length + IV_LENGTH);

    try {
      // Decrypt the data
      const decrypted = new Uint8Array(
        await subtle.decrypt(
          { name: 'AES-CBC', iv: extractedIv },
          cryptoKey,
          ciphertext
        )
      );

      // Remove padding
      return unpadData(decrypted);
    } catch (error) {
      throw createWalrusError('Decryption failed', { cause: error });
    }
  };

  /**
   * Encrypts data from a source stream and writes it to a destination stream
   */
  const encryptStream = async (
    src: ReadableStream<Uint8Array>,
    dst: WritableStream<Uint8Array>
  ): Promise<void> => {
    // Read all data from the source stream
    const data = await readStreamToUint8Array(src);

    // Encrypt the combined data
    const encrypted = await encrypt(data);

    // Write to the destination stream
    const writer = dst.getWriter();
    try {
      await writer.write(encrypted);
    } finally {
      await writer.close();
    }
  };

  /**
   * Decrypts data from a source stream and writes it to a destination stream
   */
  const decryptStream = async (
    src: ReadableStream<Uint8Array>,
    dst: WritableStream<Uint8Array>
  ): Promise<void> => {
    // Read all data from the source stream
    const data = await readStreamToUint8Array(src);

    // Decrypt the combined data
    const decrypted = await decrypt(data);

    // Write to the destination stream
    const writer = dst.getWriter();
    try {
      await writer.write(decrypted);
    } finally {
      await writer.close();
    }
  };

  // Return an object implementing the ContentCipher interface
  return {
    encrypt,
    decrypt,
    encryptStream,
    decryptStream
  };
} 