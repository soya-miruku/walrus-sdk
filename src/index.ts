// Export encryption module
export { createCipher, CipherSuite } from "./encryption";
export type { ContentCipher, CipherOptions } from "./encryption";

// Export client module
export { createWalrusClient } from "./client/walrus-client";
export type { WalrusClient } from "./client/walrus-client";

// Export types
export type {
	ClientOptions,
	StoreOptions,
	ReadOptions,
	StoreResponse,
	BlobMetadata,
	EncryptionOptions,
	BlobInfo,
	BlobObject,
	StorageInfo,
	EventInfo,
} from "./types";
export { createWalrusError } from "./types";
export type { WalrusError } from "./types";

// Export helper functions
export {
	validateUint8Array,
	validateAesKey,
	combineURLs,
	getContentTypeFromFilename,
} from "./utils/helpers";

// Export constants
export {
	DEFAULT_TESTNET_AGGREGATORS,
	DEFAULT_TESTNET_PUBLISHERS,
	DEFAULT_CONFIG,
} from "./utils/constants";

// Export logger
export {
	default as logger,
	createLogger,
	configureLogger,
	LogLevel,
} from "./utils/logger";
export type { LoggerOptions } from "./utils/logger";
