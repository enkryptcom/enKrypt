import { GasFeeType, GasPriceTypes } from "@/providers/common/types";
import SolanaAPI from "@/providers/solana/libs/api";
import { SolanaNetwork } from "@/providers/solana/types/sol-network";
import { VersionedTransaction } from "@solana/web3.js";
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
      // TODO: handle this
      throw new Error(
        `Failed to get fee for Solana VersionedTransaction ${i}. Transaction block hash possibly expired.`
      );
    }
    feesumlamp = feesumlamp.add(toBN(fee.value));
  }

  // Convert from lamports to SOL
  // Hope that we'll never get 64 bit floating point overflow in BN.toNumber()...
  const feesumsol = feesumlamp.toNumber() * 1e-9;

  // TODO: give different fees for different priority levels
  return {
    [GasPriceTypes.REGULAR]: {
      // Convert to string, cut off floating point rounding errors, trim redundant trailing 0's
      nativeValue: feesumsol.toFixed(10).replace(/\.?0+$/, ""),
      fiatValue: (price * feesumsol).toFixed(10).replace(/\.?0+$/, ""),
      nativeSymbol: "SOL",
      fiatSymbol: "USD",
    },
  };
};
