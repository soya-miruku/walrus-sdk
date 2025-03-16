import { describe, expect, test } from "bun:test";
import { createCipher } from "../encryption/index";
import { CipherSuite } from "../types";

describe("Encryption Module", () => {
  // Test data
  const plaintext = new TextEncoder().encode("Hello, Walrus Protocol!");

  // Test keys (32 bytes for AES-256)
  const key = new Uint8Array(32).fill(1);
  const iv = new Uint8Array(16).fill(2); // For CBC mode

  describe("GCM Cipher", () => {
    test("should encrypt and decrypt data correctly", async () => {
      const cipher = createCipher({
        key,
        suite: CipherSuite.AES256GCM
      });

      // Encrypt the data
      const encrypted = await cipher.encrypt(plaintext);

      // Encrypted data should be longer than plaintext (magic bytes + IV + tag)
      expect(encrypted.byteLength).toBeGreaterThan(plaintext.byteLength);

      // Decrypt the data
      const decrypted = await cipher.decrypt(encrypted);

      // Compare the decrypted data with the original
      expect(decrypted.byteLength).toBe(plaintext.byteLength);
      expect(new TextDecoder().decode(decrypted)).toBe(new TextDecoder().decode(plaintext));
    });

    test("should throw on invalid encrypted data", async () => {
      const cipher = createCipher({
        key,
        suite: CipherSuite.AES256GCM
      });

      // Try to decrypt invalid data
      const invalidData = new Uint8Array(10).fill(0);
      await expect(cipher.decrypt(invalidData)).rejects.toThrow();
    });
  });

  describe("CBC Cipher", () => {
    test("should encrypt and decrypt data correctly", async () => {
      const cipher = createCipher({
        key,
        suite: CipherSuite.AES256CBC,
        iv
      });

      // Encrypt the data
      const encrypted = await cipher.encrypt(plaintext);

      // Encrypted data should be longer than plaintext (magic bytes + IV + padding)
      expect(encrypted.byteLength).toBeGreaterThan(plaintext.byteLength);

      // Decrypt the data
      const decrypted = await cipher.decrypt(encrypted);

      // Compare the decrypted data with the original
      expect(decrypted.byteLength).toBe(plaintext.byteLength);
      expect(new TextDecoder().decode(decrypted)).toBe(new TextDecoder().decode(plaintext));
    });

    test("should throw when IV is missing", async () => {
      // Try to create a CBC cipher without IV
      expect(() => createCipher({
        key,
        suite: CipherSuite.AES256CBC
      })).toThrow();
    });

    test("should throw on invalid encrypted data", async () => {
      const cipher = createCipher({
        key,
        suite: CipherSuite.AES256CBC,
        iv
      });

      // Try to decrypt invalid data
      const invalidData = new Uint8Array(10).fill(0);
      await expect(cipher.decrypt(invalidData)).rejects.toThrow();
    });
  });

  describe("Stream Encryption", () => {
    test("should encrypt and decrypt streams correctly", async () => {
      const cipher = createCipher({
        key,
        suite: CipherSuite.AES256GCM
      });

      // Create source stream with plaintext
      const sourceStream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(plaintext);
          controller.close();
        }
      });

      // Create destination stream for encrypted data
      const encryptedChunks: Uint8Array[] = [];
      const encryptDest = new WritableStream<Uint8Array>({
        write(chunk) {
          encryptedChunks.push(chunk);
        }
      });

      // Encrypt the stream
      await cipher.encryptStream(sourceStream, encryptDest);

      // Combine encrypted chunks
      let totalLength = 0;
      for (const chunk of encryptedChunks) {
        totalLength += chunk.byteLength;
      }

      const encryptedData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of encryptedChunks) {
        encryptedData.set(chunk, offset);
        offset += chunk.byteLength;
      }

      // Create source stream with encrypted data
      const encryptedStream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encryptedData);
          controller.close();
        }
      });

      // Create destination stream for decrypted data
      const decryptedChunks: Uint8Array[] = [];
      const decryptDest = new WritableStream<Uint8Array>({
        write(chunk) {
          decryptedChunks.push(chunk);
        }
      });

      // Decrypt the stream
      await cipher.decryptStream(encryptedStream, decryptDest);

      // Combine decrypted chunks
      totalLength = 0;
      for (const chunk of decryptedChunks) {
        totalLength += chunk.byteLength;
      }

      const decryptedData = new Uint8Array(totalLength);
      offset = 0;
      for (const chunk of decryptedChunks) {
        decryptedData.set(chunk, offset);
        offset += chunk.byteLength;
      }

      // Compare the decrypted data with the original
      expect(decryptedData.byteLength).toBe(plaintext.byteLength);
      expect(new TextDecoder().decode(decryptedData)).toBe(new TextDecoder().decode(plaintext));
    });
  });
}); 