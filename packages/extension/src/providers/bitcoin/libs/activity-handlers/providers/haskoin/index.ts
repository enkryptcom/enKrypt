import MarketData from "@/libs/market-data";
import { HaskoinTxType } from "@/providers/bitcoin/types";
import {
  Activity,
  ActivityStatus,
  ActivityType,
  BTCRawInfo,
} from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
export default async (
  network: BaseNetwork,
  pubkey: string
): Promise<Activity[]> => {
  return fetch(
    `${network.node}address/${network.displayAddress(pubkey)}/transactions/full`
  )
    .then((res) => res.json())
    .then(async (txs: HaskoinTxType[]) => {
      if ((txs as any).error) return [];
      let tokenPrice = "0";
      if (network.coingeckoID) {
        const marketData = new MarketData();
        await marketData
          .getTokenPrice(network.coingeckoID)
          .then((mdata) => (tokenPrice = mdata || "0"));
      }
      const address = network.displayAddress(pubkey);
      return txs.map((tx) => {
        const rawInfo: BTCRawInfo = {
          blockNumber: tx.block.height!,
          fee: tx.fee,
          inputs: tx.inputs.map((input) => ({
            address: input.address,
            value: input.value,
          })),
          outputs: tx.outputs.map((output) => ({
            address: output.address,
            value: output.value,
          })),
          transactionHash: tx.txid,
          timestamp: tx.time * 1000,
        };
        const act: Activity = {
          from: tx.inputs[0].address,
          isIncoming: address === tx.inputs[0].address,
          network: network.name,
          status: !tx.block.mempool
            ? ActivityStatus.success
            : ActivityStatus.pending,
          timestamp: tx.time * 1000,
          to: tx.outputs[0].address,
          token: {
            decimals: network.decimals,
            icon: network.icon,
            name: network.name_long,
            symbol: network.currencyName,
            coingeckoID: network.coingeckoID,
            price: tokenPrice,
          },
          transactionHash: tx.txid,
          type: ActivityType.transaction,
          value: tx.outputs[0].value.toString(),
          rawInfo: rawInfo,
        };
        return act;
      });
    })
    .catch(() => {
      return [];
    });
};
