import { GasFeeType, GasPriceTypes } from '@/providers/common/types';
import SolanaAPI from '@/providers/solana/libs/api';
import { SolanaNetwork } from '@/providers/solana/types/sol-network';
import { fromBase } from '@enkryptcom/utils';
import {
  VersionedTransaction as SolanaVersionedTransaction,
  Transaction as SolanaLegacyTransaction,
  VersionedMessage,
  Message,
} from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { toBN } from 'web3-utils';

type TaggedLegacyTransaction = {
  kind: 'legacy';
  instance: SolanaLegacyTransaction;
  hasThirdPartySignatures: boolean;
};

type TaggedVersionedTransaction = {
  kind: 'versioned';
  instance: SolanaVersionedTransaction;
  hasThirdPartySignatures: boolean;
};

// Add support for raw transaction data
type RawTransaction = {
  kind: 'legacy' | 'versioned';
  serialized: string;
  hasThirdPartySignatures: boolean;
  isRawData: boolean;
  from: string;
  to: string;
  type: string;
  thirdPartySignatures: any[];
};

type TaggedTransaction =
  | TaggedLegacyTransaction
  | TaggedVersionedTransaction
  | RawTransaction;

function getTxBlockHash(tx: TaggedTransaction): undefined | string {
  // Skip blockhash for raw transactions
  if ('isRawData' in tx && tx.isRawData) {
    return undefined;
  }

  let recentBlockHash: undefined | string;
  switch (tx.kind) {
    case 'legacy':
      recentBlockHash = (tx as TaggedLegacyTransaction).instance
        .recentBlockhash;
      break;
    case 'versioned':
      recentBlockHash = (tx as TaggedVersionedTransaction).instance.message
        .recentBlockhash;
      break;
    default:
      throw new Error(`Unexpected Solana transaction kind ${(tx as any).kind}`);
  }
  return recentBlockHash;
}

function setTxBlockHash(tx: TaggedTransaction, blockhash: string) {
  // Check if this is raw transaction data (unprocessed)
  if ('isRawData' in tx && tx.isRawData) {
    console.info('Skipping blockhash update for raw transaction data');
    return; // Don't try to set blockhash on raw transactions
  }

  // Check if this has an instance (processed transaction)
  if ('instance' in tx && tx.instance) {
    switch (tx.kind) {
      case 'legacy':
        (tx as TaggedLegacyTransaction).instance.recentBlockhash = blockhash;
        break;
      case 'versioned':
        (tx as TaggedVersionedTransaction).instance.message.recentBlockhash =
          blockhash;
        break;
      default:
        console.warn(`Unexpected Solana transaction kind: ${(tx as any).kind}`);
        break;
    }
  } else {
    console.info('Transaction has no instance - skipping blockhash update');
  }
}

function getTxMessage(
  tx: TaggedTransaction,
): Message | VersionedMessage | null {
  // Return null for raw transactions - we can't get the message without deserializing
  if ('isRawData' in tx && tx.isRawData) {
    return null;
  }

  let msg: Message | VersionedMessage;
  switch (tx.kind) {
    case 'legacy':
      msg = (tx as TaggedLegacyTransaction).instance.compileMessage();
      break;
    case 'versioned':
      msg = (tx as TaggedVersionedTransaction).instance.message;
      break;
    default:
      throw new Error(`Unexpected Solana transaction kind ${(tx as any).kind}`);
  }
  return msg;
}

/**
 * Mutably updates transactions with the latest block hash
 * (not nice but convenient)
 */
export const getSolanaTransactionFees = async (
  txs: TaggedTransaction[],
  network: SolanaNetwork,
  price: number,
  additionalFee: ReturnType<typeof toBN>,
): Promise<Pick<GasFeeType, GasPriceTypes.REGULAR>> => {
  let feesumlamp = additionalFee;
  const conn = ((await network.api()) as SolanaAPI).web3;
  let latestBlockHash = await conn.getLatestBlockhash();

  for (let txi = 0, len = txs.length; txi < len; txi++) {
    const tx = txs[txi];

    /** For logging / debugging */
    let txkind: string;
    if ('isRawData' in tx && tx.isRawData) {
      txkind = `raw-${tx.kind}`;
    } else {
      switch (tx.kind) {
        case 'legacy':
          txkind = 'legacy';
          break;
        case 'versioned':
          txkind = `versioned (${(tx as TaggedVersionedTransaction).instance.version})`;
          break;
        default:
          txkind = `unknown (${(tx as any).kind})`;
          break;
      }
    }

    // Handle raw transactions differently
    if ('isRawData' in tx && tx.isRawData) {
      // Use a reasonable default fee for raw transactions
      // Most Solana transactions cost around 5000-10000 lamports
      const defaultFee = 10000; // 0.00001 SOL
      feesumlamp = feesumlamp.add(toBN(defaultFee));

      continue;
    }

    // Use the latest block hash in-case it's fallen too far behind
    // (can't change block hash if it's already signed)
    if (!tx.hasThirdPartySignatures) {
      setTxBlockHash(tx, latestBlockHash.blockhash);
    }

    // Not sure why but getFeeForMessage sometimes returns null, so we will retry
    // with small backoff in-case it helps
    const backoff = [0, 500, 1_500];
    /** 0 indexed attempt, used to index backoff ms from `backoff` */
    let attempt = 0;
    let fee: number;

    while (true) {
      if (attempt >= backoff.length) {
        const blockHash = getTxBlockHash(tx);
        throw new Error(
          `Failed to get fee for Solana transaction ${txi + 1}` +
            ` after ${backoff.length} attempts.` +
            ` Transaction block hash` +
            ` ${blockHash} possibly expired.` +
            `  txkind=${txkind}`,
        );
      }
      if (backoff[attempt] > 0) {
        // wait before retrying
        await new Promise(res => setTimeout(res, backoff[attempt]));
      }
      // Update the block hash in-case it caused 0 fees to be returned
      if (attempt > 0) {
        if (!tx.hasThirdPartySignatures) {
          const blockHash = getTxBlockHash(tx);
          console.warn(
            `Cannot update block hash for signed transaction` +
              ` ${txi + 1}, retrying getFeeForMessage using the same` +
              ` block hash ${blockHash}` +
              `  txkind=${txkind}`,
          );
        } else {
          latestBlockHash = await conn.getLatestBlockhash();
          setTxBlockHash(tx, latestBlockHash.blockhash);
        }
      }

      /** Base fee + priority fee (Don't know why this returns null sometimes) */
      const msg = getTxMessage(tx);
      if (msg === null) {
        // This shouldn't happen for non-raw transactions
        console.error(`Cannot get message for transaction ${txi + 1}`);
        fee = 10000; // Use default fee
        break;
      }

      const feeResult = await conn.getFeeForMessage(msg);
      if (feeResult.value == null) {
        const recentBlockHash = getTxBlockHash(tx);
        console.warn(
          `Failed to get fee for Solana transaction ${txi + 1}/${len}.` +
            ` Transaction block hash ${recentBlockHash}` +
            ` possibly expired. Attempt ${attempt + 1}/${backoff.length}.` +
            `  txkind=${txkind}`,
        );
      } else {
        // Success
        fee = feeResult.value;
        if (attempt > 0) {
          console.debug(
            `Successfully got fee for Solana transaction` +
              ` ${txi + 1}/${len} after ${attempt + 1} attempts.` +
              `  fee=${fee}` +
              `  txkind=${txkind}`,
          );
        }
        break;
      }

      attempt += 1;
    }

    feesumlamp = feesumlamp.add(toBN(fee));
  }

  // Convert from lamports to SOL
  const feesumsol = fromBase(feesumlamp.toString(), network.decimals);

  return {
    [GasPriceTypes.REGULAR]: {
      nativeValue: feesumsol,
      fiatValue: new BigNumber(feesumsol).times(price).toString(),
      nativeSymbol: 'SOL',
      fiatSymbol: 'USD',
    },
  };
};
