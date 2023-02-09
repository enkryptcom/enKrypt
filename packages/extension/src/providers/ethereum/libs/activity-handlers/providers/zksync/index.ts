import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import { numberToHex } from "web3-utils";
import {
  Activity,
  ActivityStatus,
  ActivityType,
  EthereumRawInfo,
} from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
import { decodeTx } from "../../../transaction/decoder";
import { NetworkEndpoints } from "./configs";

interface zkSyncTxInfo {
  transactionHash: string;
  data: {
    contractAddress: string;
    calldata: string;
    value: string;
  };
  status: string;
  fee: string;
  nonce: number;
  blockNumber: number;
  blockHash: string;
  initiatorAddress: string;
  receivedAt: string;
}

const getAddressActivity = async (
  address: string,
  endpoint: string
): Promise<EthereumRawInfo[]> => {
  return fetch(
    `${endpoint}transactions?limit=50&direction=older&accountAddress=${address}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
    .then((res) => res.json())
    .then((res) => {
      const results = res.list as zkSyncTxInfo[];
      const newResults = results.map((tx) => {
        const rawTx: EthereumRawInfo = {
          blockHash: tx.blockHash,
          blockNumber: numberToHex(tx.blockNumber),
          contractAddress: tx.data.contractAddress,
          data: tx.data.calldata,
          effectiveGasPrice: numberToHex(0),
          from: tx.initiatorAddress,
          to: tx.data.contractAddress,
          gas: "0x0",
          gasUsed: "0x0",
          nonce: numberToHex(tx.nonce),
          status: true,
          transactionHash: tx.transactionHash,
          value: numberToHex(tx.data.value),
          timestamp: new Date(tx.receivedAt).getTime(),
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

  const Promises = activities.map((activity) => {
    return decodeTx(activity, network as EvmNetwork).then((txData) => {
      return {
        from: activity.from,
        to: activity.contractAddress
          ? activity.contractAddress
          : txData.tokenTo!,
        isIncoming: activity.from !== address,
        network: network.name,
        rawInfo: activity,
        status: ActivityStatus.success,
        timestamp: activity.timestamp ? activity.timestamp : 0,
        value: txData.tokenValue,
        transactionHash: activity.transactionHash,
        type: ActivityType.transaction,
        token: {
          decimals: txData.tokenDecimals,
          icon: txData.tokenImage,
          name: txData.tokenName,
          symbol: txData.tokenSymbol,
          price: txData.currentPriceUSD.toString(),
        },
      };
    });
  });
  return Promise.all(Promises);
};
