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
  const latestBlockHash = await conn.getLatestBlockhash();
  for (let i = 0, len = txs.length; i < len; i++) {
    const tx = txs[i];
    // Use the latest block hash in-case it's fallen too far behind
    tx.message.recentBlockhash = latestBlockHash.blockhash;
    /** Base fee + priority fee + rent fees (but the rent fees seem slightly higher than expected @ 2024-09-04) */
    const fee = await conn.getFeeForMessage(tx.message);
    if (fee.value == null) {
      throw new Error(
        `Failed to get fee for Solana VersionedTransaction ${i}. Transaction block hash possibly expired.`
      );
    }
    feesumlamp = feesumlamp.add(toBN(fee.value));
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
