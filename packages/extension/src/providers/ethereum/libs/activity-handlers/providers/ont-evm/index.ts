import { numberToHex } from "web3-utils";
import {
  Activity,
  ActivityStatus,
  ActivityType,
  EthereumRawInfo,
} from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
import { NetworkEndpoints } from "./configs";
import { toBase } from "@enkryptcom/utils";
import MarketData from "@/libs/market-data";

interface OntEvmRawInfo {
  tx_hash: string;
  tx_time: number;
  block_height: number;
  fee: string;
  confirm_flag: number;
  transfers: {
    amount: string;
    from_address: string;
    to_address: string;
    asset_name: string;
  }[];
}

const getAddressActivity = async (
  address: string,
  endpoint: string
): Promise<EthereumRawInfo[]> => {
  return fetch(
    `${endpoint}v2/addresses/${address}/txs?page_size=20&page_number=1`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((res) => {
      const results = res.result.records as OntEvmRawInfo[];
      const newResults = results.map((tx) => {
        const rawTx: EthereumRawInfo = {
          blockHash: "",
          blockNumber: numberToHex(tx.block_height),
          contractAddress: null,
          data: "0x",
          effectiveGasPrice: "0x0",
          from: tx.transfers[0].from_address,
          to: tx.transfers[0].to_address,
          gas: "0x0",
          gasUsed: "0x0",
          nonce: "0x0",
          status: tx.confirm_flag === 1,
          transactionHash: tx.tx_hash,
          value: numberToHex(toBase(tx.transfers[0].amount, 18)),
          timestamp: tx.tx_time * 1000,
        };
        return rawTx;
      });
      return newResults.slice(0, 50) as EthereumRawInfo[];
    });
};

export default async (
  network: BaseNetwork,
  address: string
): Promise<Activity[]> => {
  address = address.toLowerCase();
  const enpoint =
    NetworkEndpoints[network.name as keyof typeof NetworkEndpoints];
  const activities = await getAddressActivity(address, enpoint);
  const marketData = new MarketData();
  const price = await marketData.getTokenPrice(network.coingeckoID!);
  const resActivities = activities.map((activity) => {
    const tActivity: Activity = {
      from: activity.from,
      to: activity.contractAddress ? activity.contractAddress : activity.to!,
      isIncoming: activity.from !== address,
      network: network.name,
      rawInfo: activity,
      status: ActivityStatus.success,
      timestamp: activity.timestamp ? activity.timestamp : 0,
      value: activity.value,
      transactionHash: activity.transactionHash,
      type: ActivityType.transaction,
      token: {
        decimals: network.decimals,
        icon: network.icon,
        name: network.name,
        symbol: network.currencyName,
        price: price!,
      },
    };
    return tActivity;
  });
  return resActivities;
};
