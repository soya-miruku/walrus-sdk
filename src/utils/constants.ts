/**
 * Default endpoints for the Walrus testnet
 */

/**
 * Default Walrus testnet publisher endpoints
 */
export const DEFAULT_TESTNET_PUBLISHERS = [
  "https://publisher.walrus-testnet.walrus.space",
  "https://wal-publisher-testnet.staketab.org",
  "https://walrus-testnet-publisher.bartestnet.com",
  "https://walrus-testnet-publisher.nodes.guru",
  "https://walrus-testnet-publisher.stakin-nodes.com",
  "https://testnet-publisher-walrus.kiliglab.io",
  "https://walrus-testnet-publisher.nodeinfra.com",
  "https://walrus-publisher.rubynodes.io",
  "https://walrus-testnet-publisher.brightlystake.com",
  "https://walrus-testnet-publisher.nami.cloud",
  "https://testnet.walrus-publisher.sm.xyz",
  "https://walrus-testnet-publisher.stakecraft.com",
  "https://pub.test.walrus.eosusa.io",
  "https://walrus-pub.testnet.obelisk.sh",
  "https://sui-walrus-testnet.bwarelabs.com/publisher",
  "https://walrus-testnet.chainbase.online/publisher",
];

/**
 * Default Walrus testnet aggregator endpoints
 */
export const DEFAULT_TESTNET_AGGREGATORS = [
  "https://aggregator.walrus-testnet.walrus.space",
  "https://wal-aggregator-testnet.staketab.org",
  "https://walrus-testnet-aggregator.bartestnet.com",
  "https://walrus-testnet.blockscope.net",
  "https://walrus-testnet-aggregator.nodes.guru",
  "https://walrus-cache-testnet.overclock.run",
  "https://walrus-testnet-aggregator.stakin-nodes.com",
  "https://testnet-aggregator-walrus.kiliglab.io",
  "https://walrus-cache-testnet.latitude-sui.com",
  "https://walrus-testnet-aggregator.nodeinfra.com",
  "https://walrus-testnet.stakingdefenseleague.com",
  "https://walrus-aggregator.rubynodes.io",
  "https://walrus-testnet-aggregator.brightlystake.com",
  "https://walrus-testnet-aggregator.nami.cloud",
  "https://testnet.walrus-publisher.sm.xyz",
  "https://walrus-testnet-aggregator.stakecraft.com",
];

/**
 * Default configuration constants
 */
export const DEFAULT_CONFIG = {
  /** Default maximum number of retry attempts */
  MAX_RETRIES: 5,

  /** Default delay between retry attempts in milliseconds */
  RETRY_DELAY: 500,

  /** Default maximum size for uploads when content length is unknown (5MB) */
  MAX_UNKNOWN_LENGTH_UPLOAD_SIZE: 5 * 1024 * 1024,
}; 