import { GasFeeType } from "@/providers/common/types";
import { BaseNetwork } from "@/types/base-network";
import { calculateSizeBasedOnType } from "@/providers/bitcoin/ui/libs/tx-size";
import { BTCTxInfo } from "@/providers/bitcoin/ui/types";
import { getGasCostValues } from "@/providers/bitcoin/libs/utils";
import { BitcoinNetwork } from "@/providers/bitcoin/types/bitcoin-network";

export const getBitcoinGasVals = async (
  txs: any[],
  network: BaseNetwork,
  price: number
): Promise<GasFeeType> => {
  const tx = txs[0] as BTCTxInfo;
  const txSize = calculateSizeBasedOnType(
    tx.inputs.length,
    2,
    (network as BitcoinNetwork).networkInfo.paymentType
  );
  return getGasCostValues(
    network as BitcoinNetwork,
    Math.ceil(txSize),
    price.toString(),
    network.decimals,
    network.currencyName
  );
};
