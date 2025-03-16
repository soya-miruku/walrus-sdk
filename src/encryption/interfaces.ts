import type { CipherSuite } from "../types";

/**
 * Interface for content encryption and decryption
 */
export interface ContentCipher {
	/**
	 * Encrypts data from a source stream and writes it to a destination stream
	 * @param src Source readable stream containing plaintext
	 * @param dst Destination writable stream to receive ciphertext
	 */
	encryptStream(
		src: ReadableStream<Uint8Array>,
		dst: WritableStream<Uint8Array>,
	): Promise<void>;

	/**
	 * Decrypts data from a source stream and writes it to a destination stream
	 * @param src Source readable stream containing ciphertext
	 * @param dst Destination writable stream to receive plaintext
	 */
	decryptStream(
		src: ReadableStream<Uint8Array>,
		dst: WritableStream<Uint8Array>,
	): Promise<void>;

	/**
	 * Encrypts a Uint8Array
	 * @param data Plaintext data to encrypt
	 * @returns Encrypted data
	 */
	encrypt(data: Uint8Array): Promise<Uint8Array>;

	/**
	 * Decrypts a Uint8Array
	 * @param data Encrypted data to decrypt
	 * @returns Decrypted data
	 */
	decrypt(data: Uint8Array): Promise<Uint8Array>;
}

/**
 * Options for creating a cipher
 */
export interface CipherOptions {
	/**
	 * The encryption/decryption key
	 * Should be 16, 24, or 32 bytes for AES-128, AES-192, or AES-256
	 */
	key: Uint8Array;

	/**
	 * The encryption suite to use
	 */
	suite: CipherSuite;

	/**
	 * Initialization Vector, required for CBC mode
	 * Must be 16 bytes
	 */
	iv?: Uint8Array;
}
