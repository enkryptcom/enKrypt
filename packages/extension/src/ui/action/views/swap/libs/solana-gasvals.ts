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

type TaggedTransaction = TaggedLegacyTransaction | TaggedVersionedTransaction;

function getTxBlockHash(tx: TaggedTransaction): undefined | string {
  let recentBlockHash: undefined | string;
  switch (tx.kind) {
    case 'legacy':
      recentBlockHash = tx.instance.recentBlockhash;
      break;
    case 'versioned':
      recentBlockHash = tx.instance.message.recentBlockhash;
      break;
    default:
      tx satisfies never;
      throw new Error(`Unexpected Solana transaction kind ${(tx as any).kind}`);
  }
  return recentBlockHash;
}

function setTxBlockHash(tx: TaggedTransaction, blockHash: string): void {
  switch (tx.kind) {
    case 'legacy':
      tx.instance.recentBlockhash = blockHash;
      break;
    case 'versioned':
      tx.instance.message.recentBlockhash = blockHash;
      break;
    default:
      tx satisfies never;
      throw new Error(`Unexpected Solana transaction kind ${(tx as any).kind}`);
  }
}

function getTxMessage(tx: TaggedTransaction): Message | VersionedMessage {
  let msg: Message | VersionedMessage;
  switch (tx.kind) {
    case 'legacy':
      msg = tx.instance.compileMessage();
      break;
    case 'versioned':
      msg = tx.instance.message;
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
  txs: (TaggedLegacyTransaction | TaggedVersionedTransaction)[],
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
    switch (tx.kind) {
      case 'legacy':
        txkind = 'legacy';
        break;
      case 'versioned':
        txkind = `versioned (${tx.instance.version})`;
        break;
      case undefined:
        txkind = 'legacy';
        break;
      default:
        txkind = `unknown (${(tx as SolanaVersionedTransaction).version})`;
        break;
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
