import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import {
  Activity,
  ActivityStatus,
  ActivityType,
  EthereumRawInfo,
} from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
import { toBN } from "web3-utils";
import { decodeTx } from "../../../transaction/decoder";
import { NetworkEndpoints } from "./configs";
const getAddressActivity = async (
  address: string,
  endpoint: string
): Promise<EthereumRawInfo[]> => {
  const transactions = fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: 0,
      method: "flume_getTransactionsByParticipant",
      params: [address],
    }),
  })
    .then((res) => res.json())
    .then((res) => res.result.items as EthereumRawInfo[]);

  const transactionsReceipts = fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: 0,
      method: "flume_getTransactionReceiptsByParticipant",
      params: [address],
    }),
  })
    .then((res) => res.json())
    .then((res) => res.result.items as EthereumRawInfo[]);
  return Promise.all([transactions, transactionsReceipts]).then((responses) => {
    let allInfo = responses[0].reverse().map((item) => {
      const receipt = responses[1].find(
        (r) => r.transactionHash === (item as any).hash
      );
      if (receipt) {
        receipt.status =
          (receipt.status as unknown as string) === "0x1" ? true : false;
        return { ...item, ...receipt, data: (item as any).input };
      }
      return null;
    });
    allInfo = allInfo.filter((i) => i !== null);
    return allInfo.slice(0, 50) as EthereumRawInfo[];
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
        status: activity.status
          ? ActivityStatus.success
          : ActivityStatus.failed,
        timestamp: activity.timestamp
          ? toBN(activity.timestamp).toNumber() * 1000
          : 0,
        value: txData.tokenValue,
        transactionHash: activity.transactionHash,
        type: ActivityType.transaction,
        nonce: activity.nonce,
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
