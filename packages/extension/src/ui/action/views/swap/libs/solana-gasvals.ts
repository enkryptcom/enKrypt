import { GasFeeType, GasPriceTypes } from "@/providers/common/types";
import SolanaAPI from "@/providers/solana/libs/api";
import { SolanaNetwork } from "@/providers/solana/types/sol-network";
import { fromBase } from "@enkryptcom/utils";
import { VersionedTransaction } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { toBN } from "web3-utils";

/**
 * Mutably updates transactions with the latest block hash
 * (not nice but convenient)
 */
export const getSolanaTransactionFees = async (
  txs: VersionedTransaction[],
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
    tx.message.recentBlockhash = latestBlockHash.blockhash;

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
            ` Transaction block hash ${tx.message.recentBlockhash} possibly expired.`
        );
      }
      if (backoff[attempt] > 0) {
        // wait before retrying
        await new Promise((res) => {
          return setTimeout(res, backoff[attempt]);
        });
      }
      // Update the block hash in-case it caused 0 fees to be returned
      if (attempt > 0) {
        latestBlockHash = await conn.getLatestBlockhash();
        tx.message.recentBlockhash = latestBlockHash.blockhash;
      }

      /** Base fee + priority fee (Don't know why this returns null sometimes) */
      const feeResult = await conn.getFeeForMessage(tx.message);
      if (feeResult.value == null) {
        console.warn(
          `Failed to get fee for Solana VersionedTransaction` +
            ` ${i + 1}. Transaction block hash ${tx.message.recentBlockhash}` +
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

  // TODO: give different fees for different priority levels
  return {
    [GasPriceTypes.REGULAR]: {
      nativeValue: feesumsol,
      fiatValue: new BigNumber(feesumsol).times(price).toString(),
      nativeSymbol: "SOL",
      fiatSymbol: "USD",
    },
  };
};
