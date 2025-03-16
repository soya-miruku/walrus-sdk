import type { ContentCipher, CipherOptions } from './interfaces';
import { createGCMCipher } from './gcm';
import { createCBCCipher } from './cbc';
import { CipherSuite, createWalrusError } from '../types';

/**
 * Creates a cipher implementation based on the specified options
 * @param options Cipher options
 * @returns A ContentCipher implementation
 */
export function createCipher(options: CipherOptions): ContentCipher {
  // Validate key
  if (!(options.key instanceof Uint8Array)) {
    throw createWalrusError('Encryption key must be a Uint8Array');
  }

  // Create the appropriate cipher based on the suite
  switch (options.suite) {
    case CipherSuite.AES256GCM:
      return createGCMCipher(options.key);

    case CipherSuite.AES256CBC:
      if (!options.iv) {
        throw createWalrusError('Initialization vector (IV) is required for AES-CBC mode');
      }
      return createCBCCipher(options);

    default:
      throw createWalrusError(`Unsupported cipher suite: ${options.suite}`);
  }
}

// Re-export types
export type { ContentCipher, CipherOptions } from './interfaces';
export { CipherSuite } from '../types'; 