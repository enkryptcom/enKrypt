import cacheFetch from "@/libs/cache-fetch";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import {
  Activity,
  ActivityStatus,
  ActivityType,
  EthereumRawInfo,
} from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
import { numberToHex } from "web3-utils";
import { decodeTx } from "../../../transaction/decoder";
import { NetworkEndpoints } from "./configs";
import { EtherscanTxType } from "./types";
const TTL = 30000;
const getAddressActivity = async (
  address: string,
  endpoint: string
): Promise<EthereumRawInfo[]> => {
  return cacheFetch(
    {
      url: `${endpoint}api?module=account&action=txlist&address=${address}`,
    },
    TTL
  ).then((res) => {
    if (res.status === "0") return [];
    const results = res.result as EtherscanTxType[];
    const newResults = results.reverse().map((tx) => {
      const rawTx: EthereumRawInfo = {
        blockHash: tx.blockHash,
        blockNumber: numberToHex(tx.blockNumber),
        contractAddress: tx.contractAddress,
        data: tx.input,
        effectiveGasPrice: numberToHex(tx.gasPrice),
        from: tx.from,
        to: tx.to === "" ? null : tx.to,
        gas: numberToHex(tx.gas),
        gasUsed: numberToHex(tx.gasUsed),
        nonce: numberToHex(tx.nonce),
        status: tx.isError === "0" ? true : false,
        transactionHash: tx.hash,
        value: numberToHex(tx.value),
        timestamp: parseInt(tx.timeStamp) * 1000,
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
        status: activity.status
          ? ActivityStatus.success
          : ActivityStatus.failed,
        timestamp: activity.timestamp ? activity.timestamp : 0,
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
