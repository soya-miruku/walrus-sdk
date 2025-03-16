/**
 * Types for the Walrus SDK
 */

import type { LoggerOptions } from '../utils/logger';

/**
 * Configuration options for the Walrus client
 */
export interface ClientOptions {
  /** URLs of the Walrus aggregator endpoints */
  aggregatorURLs?: string[];

  /** URLs of the Walrus publisher endpoints */
  publisherURLs?: string[];

  /** Maximum number of retry attempts for API calls */
  maxRetries?: number;

  /** Delay between retry attempts in milliseconds */
  retryDelay?: number;

  /** Maximum allowed size for uploads when content length is unknown (in bytes) */
  maxUnknownLengthUploadSize?: number;

  /** Custom fetch implementation (defaults to Bun's native fetch) */
  fetch?: typeof fetch;

  /** Logger configuration options */
  logger?: LoggerOptions;
}

/**
 * Supported encryption cipher suites
 */
export enum CipherSuite {
  AES256GCM = 'AES256GCM',
  AES256CBC = 'AES256CBC',
}

/**
 * Encryption options for storing and retrieving data
 */
export interface EncryptionOptions {
  /** 
   * The encryption/decryption key
   * Should be 16, 24, or 32 bytes for AES-128, AES-192, or AES-256
   */
  key: Uint8Array;

  /** The encryption suite to use: AES256GCM (default) or AES256CBC */
  suite?: CipherSuite;

  /** 
   * Initialization Vector, required for CBC mode
   * Must be 16 bytes
   */
  iv?: Uint8Array;
}

/**
 * Options for storing data
 */
export interface StoreOptions {
  /** Number of storage epochs. Determines how long the data is stored */
  epochs?: number;

  /** Optional encryption configuration. If provided, data will be encrypted before storage */
  encryption?: EncryptionOptions;

  /** Content type of the data being stored (e.g., 'application/json', 'image/png') */
  contentType?: string;
}

/**
 * Options for reading data
 */
export interface ReadOptions {
  /** 
   * Optional decryption configuration. Must be provided with the same key 
   * used for encryption to successfully decrypt the data
   */
  encryption?: EncryptionOptions;
}

/**
 * Information about a stored blob
 */
export interface BlobInfo {
  /** Unique identifier for the stored blob */
  blobId: string;

  /** The epoch at which the blob's storage will end */
  endEpoch: number;
}

/**
 * Information about a blob object on the Walrus storage
 */
export interface BlobObject {
  /** Unique identifier for the blob object */
  id: string;

  /** The epoch at which the blob was stored */
  storedEpoch: number;

  /** Unique identifier for the blob content */
  blobId: string;

  /** Size of the blob in bytes */
  size: number;

  /** Type of erasure coding used for the blob */
  erasureCodeType: string;

  /** The epoch at which the blob was certified */
  certifiedEpoch: number;

  /** Storage information for the blob */
  storage: StorageInfo;
}

/**
 * Storage information for a blob
 */
export interface StorageInfo {
  /** Unique identifier for the storage */
  id: string;

  /** The epoch at which storage started */
  startEpoch: number;

  /** The epoch at which storage will end */
  endEpoch: number;

  /** Size of the stored data in bytes */
  storageSize: number;
}

/**
 * Event information for blob certification
 */
export interface EventInfo {
  /** Transaction digest */
  txDigest: string;

  /** Event sequence */
  eventSeq: string;
}

/**
 * Response from a store operation
 */
export interface StoreResponse {
  /** Basic blob information */
  blob: BlobInfo;

  /** Information for newly created blobs */
  newlyCreated?: {
    /** The blob object information */
    blobObject: BlobObject;

    /** Size of the encoded blob in bytes */
    encodedSize: number;

    /** Cost of storing the blob */
    cost: number;
  };

  /** Information for already certified blobs */
  alreadyCertified?: {
    /** Unique identifier for the blob */
    blobId: string;

    /** Certification event information */
    event: EventInfo;

    /** The epoch at which storage will end */
    endEpoch: number;
  };
}

/**
 * Metadata information for a blob
 */
export interface BlobMetadata {
  /** Size of the blob in bytes */
  contentLength: number;

  /** MIME type of the content */
  contentType: string;

  /** Last modification timestamp */
  lastModified: string;

  /** Entity tag for cache validation */
  etag: string;
}

/**
 * Error factory for the Walrus SDK
 * @param message Error message
 * @param options Additional error options
 * @returns A new Error object with Walrus-specific properties
 */
export function createWalrusError(
  message: string,
  options?: { statusCode?: number; cause?: unknown }
): Error {
  const error = new Error(message);
  error.name = 'WalrusError';

  // Add custom properties
  Object.defineProperties(error, {
    statusCode: {
      value: options?.statusCode,
      enumerable: true,
      writable: false
    },
    cause: {
      value: options?.cause,
      enumerable: true,
      writable: false
    }
  });

  return error;
}

// For backward compatibility
export type WalrusError = Error & {
  statusCode?: number;
  cause?: unknown;
}; 