// This is copied from @solana/wallet-standard-chains

import type { IdentifierString } from '@wallet-standard/base';
import type { Transaction, VersionedTransaction } from '@solana/web3.js';

/** Solana Mainnet (beta) cluster, e.g. https://api.mainnet-beta.solana.com */
export const SOLANA_MAINNET_CHAIN = 'solana:mainnet';

// /** Solana Devnet cluster, e.g. https://api.devnet.solana.com */
// export const SOLANA_DEVNET_CHAIN = "solana:devnet";

/** Array of all Solana clusters */
export const SOLANA_CHAINS = [
  SOLANA_MAINNET_CHAIN,
  // SOLANA_DEVNET_CHAIN,
] as const;

/** Type of all Solana clusters */
export type SolanaChain = (typeof SOLANA_CHAINS)[number];

/**
 * Check if a chain corresponds with one of the Solana clusters.
 */
export function isSolanaChain(chain: IdentifierString): chain is SolanaChain {
  return SOLANA_CHAINS.includes(chain as SolanaChain);
}

export function isVersionedTransaction(
  transaction: Transaction | VersionedTransaction,
): transaction is VersionedTransaction {
  return 'version' in transaction;
}
