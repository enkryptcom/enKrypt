import { GasPriceTypes } from "@/providers/common/types";
import { BaseNetwork } from "@/types/base-network";
import { fromBase } from "@enkryptcom/utils";
import BigNumber from "bignumber.js";

export const getSubstrateGasVals = async (
  txs: any[],
  fromAddress: string,
  network: BaseNetwork,
  price: number
) => {
  const tx = txs[0];
  const gas = (await tx.paymentInfo(fromAddress)).partialFee.toHex();
  const nativeValue = fromBase(gas as `0x${string}`, network.decimals);
  return {
    [GasPriceTypes.REGULAR]: {
      nativeValue: fromBase(gas as `0x${string}`, network.decimals),
      fiatValue: BigNumber(nativeValue).times(price).toFixed(4),
      nativeSymbol: network.currencyName,
      fiatSymbol: "USD",
    },
  };
};
