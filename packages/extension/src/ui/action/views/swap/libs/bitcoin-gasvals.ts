import { GasFeeType } from "@/providers/common/types";
import { BaseNetwork } from "@/types/base-network";
import { calculateSize } from "@/providers/bitcoin/ui/libs/tx-size";
import { BTCTxInfo } from "@/providers/bitcoin/ui/types";
import { getGasCostValues } from "@/providers/bitcoin/libs/utils";
import { BitcoinNetwork } from "@/providers/bitcoin/types/bitcoin-network";

export const getBitcoinGasVals = async (
  txs: any[],
  network: BaseNetwork,
  price: number
): Promise<GasFeeType> => {
  const tx = txs[0] as BTCTxInfo;
  const txSize = calculateSize(
    {
      input_count: tx.inputs.length,
    },
    {
      p2wpkh_output_count: 2,
    }
  );
  return getGasCostValues(
    network as BitcoinNetwork,
    Math.ceil(txSize.txVBytes),
    price.toString(),
    network.decimals,
    network.currencyName
  );
};
