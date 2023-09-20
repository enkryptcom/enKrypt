import MarketData from "@/libs/market-data";
import { SSTxType } from "@/providers/bitcoin/types";
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
    `${network.node}/api/v1/account/${network.displayAddress(
      pubkey
    )}/txs?pageSize=40`
  )
    .then((res) => res.json())
    .then(async (txs: { txs: SSTxType[] }) => {
      if ((txs as any).message) return [];
      let tokenPrice = "0";
      if (network.coingeckoID) {
        const marketData = new MarketData();
        await marketData
          .getTokenPrice(network.coingeckoID)
          .then((mdata) => (tokenPrice = mdata || "0"));
      }

      const address = network.displayAddress(pubkey);
      const cleanedTxs = txs.txs.map((tx) => {
        return {
          ...tx,
          vin: tx.vin.filter((vi) => vi.addresses),
          vout: tx.vout.filter((vo) => vo.addresses),
        };
      });
      return cleanedTxs.map((tx) => {
        const isIncoming = !tx.vin.find((i) => i.addresses![0] === address);
        console.log(isIncoming, tx.vin, tx.vout, address);
        let toAddress = "";
        let value = 0;

        if (isIncoming) {
          const relevantOut = tx.vout.find(
            (tx) => tx.addresses![0] === address
          );
          if (relevantOut) {
            toAddress = relevantOut.addresses![0];
            value = Number(relevantOut.value);
          }
        } else {
          const relevantOut = tx.vout.find(
            (tx) => tx.addresses![0] !== address
          );
          if (relevantOut) {
            toAddress = relevantOut.addresses![0];
            value = Number(relevantOut.value);
          } else {
            toAddress = tx.vout[0].addresses![0];
            value = Number(tx.vout[0].value);
          }
        }

        const rawInfo: BTCRawInfo = {
          blockNumber: tx.blockHeight!,
          fee: Number(tx.fee),
          inputs: tx.vin.map((input) => ({
            address: input.addresses![0],
            value: Number(input.value),
          })),
          outputs: tx.vout.map((output) => ({
            address: output.addresses![0],
            value: Number(output.value),
          })),
          transactionHash: tx.txid,
          timestamp: tx.timestamp * 1000,
        };
        const act: Activity = {
          from: tx.vin[0].addresses![0],
          isIncoming,
          network: network.name,
          status:
            tx.blockHeight > 0
              ? ActivityStatus.success
              : ActivityStatus.pending,
          timestamp: tx.timestamp * 1000,
          to: toAddress,
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
          value: value.toString(),
          rawInfo: rawInfo,
        };
        return act;
      });
    })
    .catch(() => {
      return [];
    });
};
