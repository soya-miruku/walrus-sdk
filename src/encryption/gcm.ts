import type { ContentCipher } from './interfaces';
import { validateAesKey } from '../utils/helpers';
import { createWalrusError } from '../types';

// Magic bytes to identify encrypted content (WAL)
const MAGIC_BYTES = new Uint8Array([0x57, 0x41, 0x4C]);

// AES-GCM parameters
const IV_LENGTH = 12; // 96 bits as recommended for GCM
const TAG_LENGTH = 16; // 128 bits authentication tag

/**
 * Creates a ContentCipher implementation using AES-GCM
 * @param keyData Raw key bytes (must be 16, 24, or 32 bytes)
 * @returns An implementation of the ContentCipher interface
 */
export function createGCMCipher(keyData: Uint8Array): ContentCipher {
  // Validate key before proceeding
  validateAesKey(keyData);

  // Private state
  let key: CryptoKey | null = null;
  const subtle = crypto.subtle;

  /**
   * Imports the raw key bytes into a CryptoKey
   */
  const importKey = async (): Promise<CryptoKey> => {
    if (key) return key;

    try {
      key = await subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false, // Not extractable
        ['encrypt', 'decrypt'] // Key usages
      );
      return key;
    } catch (error) {
      throw createWalrusError('Failed to import key for AES-GCM', { cause: error });
    }
  };

  /**
   * Ensures that the crypto key is available, importing it if necessary
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
   * Encrypts a Uint8Array using AES-GCM
   * @param data Plaintext data to encrypt
   * @returns Encrypted data with format: [magic bytes][iv][ciphertext]
   */
  const encrypt = async (data: Uint8Array): Promise<Uint8Array> => {
    const cryptoKey = await ensureKey();

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Encrypt the data
    const ciphertext = await subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: TAG_LENGTH * 8 // In bits
      },
      cryptoKey,
      data
    );

    // Combine magic bytes, IV, and ciphertext
    const result = new Uint8Array(MAGIC_BYTES.length + iv.length + ciphertext.byteLength);
    result.set(MAGIC_BYTES, 0);
    result.set(iv, MAGIC_BYTES.length);
    result.set(new Uint8Array(ciphertext), MAGIC_BYTES.length + iv.length);

    return result;
  };

  /**
   * Decrypts a Uint8Array using AES-GCM
   * @param data Encrypted data in format: [magic bytes][iv][ciphertext]
   * @returns Decrypted plaintext
   */
  const decrypt = async (data: Uint8Array): Promise<Uint8Array> => {
    const cryptoKey = await ensureKey();

    // Check magic bytes
    const magicBytesSlice = data.slice(0, MAGIC_BYTES.length);
    if (!MAGIC_BYTES.every((byte, i) => byte === magicBytesSlice[i])) {
      throw createWalrusError('Invalid encrypted data: missing magic bytes');
    }

    // Extract IV and ciphertext
    const iv = data.slice(MAGIC_BYTES.length, MAGIC_BYTES.length + IV_LENGTH);
    const ciphertext = data.slice(MAGIC_BYTES.length + IV_LENGTH);

    try {
      // Decrypt the data
      const plaintext = await subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
          tagLength: TAG_LENGTH * 8 // In bits
        },
        cryptoKey,
        ciphertext
      );

      return new Uint8Array(plaintext);
    } catch (error) {
      throw createWalrusError('Decryption failed: invalid key or corrupted data', { cause: error });
    }
  };

  /**
   * Process all data from a stream and combine into a single Uint8Array
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

    // Combine chunks
    const data = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return data;
  };

  /**
   * Encrypts data from a source stream and writes it to a destination stream
   * @param src Source readable stream containing plaintext
   * @param dst Destination writable stream to receive ciphertext
   */
  const encryptStream = async (
    src: ReadableStream<Uint8Array>,
    dst: WritableStream<Uint8Array>
  ): Promise<void> => {
    // Read all data from the source stream
    const data = await readStreamToUint8Array(src);

    // Encrypt the combined data
    const encrypted = await encrypt(data);

    // Write the encrypted data to the destination stream
    const writer = dst.getWriter();
    try {
      await writer.write(encrypted);
    } finally {
      await writer.close();
    }
  };

  /**
   * Decrypts data from a source stream and writes it to a destination stream
   * @param src Source readable stream containing ciphertext
   * @param dst Destination writable stream to receive plaintext
   */
  const decryptStream = async (
    src: ReadableStream<Uint8Array>,
    dst: WritableStream<Uint8Array>
  ): Promise<void> => {
    // Read all data from the source stream
    const data = await readStreamToUint8Array(src);

    // Decrypt the combined data
    const decrypted = await decrypt(data);

    // Write the decrypted data to the destination stream
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