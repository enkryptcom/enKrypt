// TODO: is this worth trying to figure out for Solana? It's so cheap anyway

import { GasFeeType, GasPriceTypes } from "@/providers/common/types";
import SolanaAPI from "@/providers/solana/libs/api";
import { SolanaNetwork } from "@/providers/solana/types/sol-network";
import { VersionedTransaction } from "@solana/web3.js";
import { toBN } from "web3-utils";

export const getSolanaTransactionFees = async (
  txs: VersionedTransaction[],
  network: SolanaNetwork,
  price: number,
  additionalFee: ReturnType<typeof toBN>
): Promise<Pick<GasFeeType, GasPriceTypes.REGULAR>> => {
  // NOTE: if this is too slow we can do it in parallel or we can
  // try to calculate the fee ourselves
  let feesumlamp = additionalFee;
  const conn = ((await network.api()) as SolanaAPI).web3;
  for (let i = 0, len = txs.length; i < len; i++) {
    const tx = txs[i];
    const fee = await conn.getFeeForMessage(tx.message, "processed");
    if (fee.value == null) {
      // TODO: handle this
      throw new Error(
        `Failed to get fee for Solana VersionedTransaction ${i}. Transaction block hash possibly expired.`
      );
    }
    feesumlamp = feesumlamp.add(toBN(fee.value));
  }

  // Convert from lamports to SOL
  // TODO: are we at risk of float overflow? (I think BN throws an error
  // on float overflow, i.e. bn.toNumber() > 2 ** 53)
  // NOTE: Solana has 9 decimals (hence 10e-10)
  const feesumsol = feesumlamp.toNumber() * 10e-10;

  // TODO: give different fees for different priority levels
  return {
    // [GasPriceTypes.ECONOMY]: {
    //   nativeValue: feesumsol.toString(),
    //   fiatValue: (price * feesumsol).toString(),
    //   nativeSymbol: "SOL",
    //   fiatSymbol: "USD",
    // },
    [GasPriceTypes.REGULAR]: {
      nativeValue: feesumsol.toString(),
      fiatValue: (price * feesumsol).toString(),
      nativeSymbol: "SOL",
      fiatSymbol: "USD",
    },
    // [GasPriceTypes.FAST]: {
    //   nativeValue: feesumsol.toString(),
    //   fiatValue: (price * feesumsol).toString(),
    //   nativeSymbol: "SOL",
    //   fiatSymbol: "USD",
    // },
    // [GasPriceTypes.FASTEST]: {
    //   nativeValue: (feesumsol * 10e9).toString(),
    //   fiatValue: (price * feesumsol * 10e9).toString(),
    //   nativeSymbol: "SOL",
    //   fiatSymbol: "USD",
    // },
  };
};
