import { GasFeeType, GasPriceTypes } from "@/providers/common/types";
import SolanaAPI from "@/providers/solana/libs/api";
import { SolanaNetwork } from "@/providers/solana/types/sol-network";
import { fromBase } from "@enkryptcom/utils";
import {
  VersionedTransaction as SolanaVersionedTransaction,
  Transaction as SolanaLegacyTransaction,
  VersionedMessage,
  Message,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { toBN } from "web3-utils";

/**
 * Mutably updates transactions with the latest block hash
 * (not nice but convenient)
 */
export const getSolanaTransactionFees = async (
  txs: (SolanaVersionedTransaction | SolanaLegacyTransaction)[],
  network: SolanaNetwork,
  price: number,
  additionalFee: ReturnType<typeof toBN>
): Promise<Pick<GasFeeType, GasPriceTypes.REGULAR>> => {
  let feesumlamp = additionalFee;
  const conn = ((await network.api()) as SolanaAPI).web3;
  let latestBlockHash = await conn.getLatestBlockhash();
  for (let i = 0, len = txs.length; i < len; i++) {
    const tx = txs[i];

    // Use the latest block hash in-case it's fallen too far behind
    // (can't change block hash if it's already signed)
    if (!tx.signatures.length) {
      updateBlockHash(tx, latestBlockHash.blockhash);
    }

    // Not sure why but getFeeForMessage sometimes returns null, so we will retry
    // with small backoff in-case it helps
    const backoff = [0, 500, 1_500];
    /** 0 indexed attempt, used to index backoff ms from `backoff` */
    let attempt = 0;
    let fee: number;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (attempt >= backoff.length) {
        throw new Error(
          `Failed to get fee for Solana VersionedTransaction ${i + 1}` +
            ` after ${backoff.length} attempts.` +
            ` Transaction block hash` +
            `${getRecentBlockHash(tx)} possibly expired.`
        );
      }
      if (backoff[attempt] > 0) {
        // wait before retrying
        await new Promise((res) => setTimeout(res, backoff[attempt]));
      }
      // Update the block hash in-case it caused 0 fees to be returned
      if (attempt > 0) {
        if (!tx.signatures.length) {
          console.warn(
            `Cannot update block hash for signed transaction` +
              ` ${i + 1}, retrying getFeeForMessage using the same` +
              ` block hash ${getRecentBlockHash(tx)}`
          );
        } else {
          latestBlockHash = await conn.getLatestBlockhash();
          updateBlockHash(tx, latestBlockHash.blockhash);
        }
      }

      /** Base fee + priority fee (Don't know why this returns null sometimes) */
      const feeResult = await conn.getFeeForMessage(getMessage(tx));
      if (feeResult.value == null) {
        console.warn(
          `Failed to get fee for Solana VersionedTransaction ${i + 1}.` +
            ` Transaction block hash ${getRecentBlockHash(tx)}` +
            ` possibly expired. Attempt ${attempt + 1}/${backoff.length}.`
        );
      } else {
        // Success
        fee = feeResult.value;
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
      nativeSymbol: "SOL",
      fiatSymbol: "USD",
    },
  };
};

function getRecentBlockHash(
  tx: SolanaVersionedTransaction | SolanaLegacyTransaction
): string {
  return getMessage(tx).recentBlockhash;
}

function updateBlockHash(
  tx: SolanaVersionedTransaction | SolanaLegacyTransaction,
  recentBlockHash: string
): void {
  switch ((tx as SolanaVersionedTransaction).version) {
    case 0:
    case "legacy":
      (tx as SolanaVersionedTransaction).message.recentBlockhash =
        recentBlockHash;
      break;
    case undefined:
      (tx as SolanaLegacyTransaction).recentBlockhash = recentBlockHash;
      break;
    default:
      throw new Error(
        `Cannot set block hash for Solana transaction: unexpected Solana transaction` +
          ` type ${Object.getPrototypeOf(tx).constructor.name}`
      );
  }
}

function getMessage(
  tx: SolanaVersionedTransaction | SolanaLegacyTransaction
): Message | VersionedMessage {
  switch ((tx as SolanaVersionedTransaction).version) {
    case 0:
    case "legacy":
      return (tx as SolanaVersionedTransaction).message;
    case undefined:
      return (tx as SolanaLegacyTransaction).compileMessage();
    default:
      throw new Error(
        `Cannot get Solana transaction message: unexpected Solana transaction` +
          ` type ${Object.getPrototypeOf(tx).constructor.name}`
      );
  }
}
