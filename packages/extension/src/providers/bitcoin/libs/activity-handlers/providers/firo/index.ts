import MarketData from "@/libs/market-data";
import { FiroTxType } from "@/providers/bitcoin/types";
import { Activity, ActivityStatus, ActivityType } from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";

export default async (
  network: BaseNetwork,
  pubkey: string
): Promise<Activity[]> => {
  return fetch(
    `${network.node}/insight-api-zcoin/txs?address=${network.displayAddress(
      pubkey
    )}&pageSize=40`
  )
    .then((res) => res.json())
    .then(async (txs: { txs: FiroTxType[] }) => {
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
          vin: tx.vin.filter((vi) => vi.addr),
          vout: tx.vout.filter((vo) => vo.scriptPubKey.addresses),
        };
      });

      return cleanedTxs.map((tx) => {
        const isIncoming = !tx.vin.find((i) => i.addr === address);

        let toAddress = "";
        let value = 0;

        if (isIncoming) {
          const relevantOut = tx.vout.find(
            (tx) => tx.scriptPubKey.addresses![0] === address
          );
          if (relevantOut) {
            toAddress = relevantOut.scriptPubKey.addresses![0];
            value = Number(relevantOut.value);
          }
        } else {
          const relevantOut = tx.vout.find(
            (tx) => tx.scriptPubKey.addresses![0] !== address
          );
          if (relevantOut) {
            toAddress = relevantOut.scriptPubKey.addresses![0];
            value = Number(relevantOut.value);
          } else {
            toAddress = tx.vout[0].scriptPubKey.addresses![0];
            value = Number(tx.vout[0].value);
          }
        }

        const act: Activity = {
          from: tx.vin?.[0]?.addr,
          isIncoming,
          network: network.name,
          status:
            tx.blockheight > 0
              ? ActivityStatus.success
              : ActivityStatus.pending,
          timestamp: Number(tx.time) * 1000,
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
          value: (+value * 100000000).toString(),
          rawInfo: {
            blockNumber: tx.blockheight,
            fee: Number(tx?.fees),
            inputs: tx.vin.map((input) => ({
              address: input.addr,
              value: Number(input.value),
            })),
            outputs: tx.vout.map((output) => ({
              address: output.scriptPubKey.addresses![0],
              value: Number(output.value),
              pkscript: output.scriptPubKey.hex,
            })),
            transactionHash: tx.txid,
            timestamp: Number(tx.time) * 1000,
          },
        };
        return act;
      });
    })
    .catch((error) => {
      console.log({ error });
      return [];
    });
};
