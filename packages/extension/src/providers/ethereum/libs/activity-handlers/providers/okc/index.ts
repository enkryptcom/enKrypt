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
import { toBase } from "@enkryptcom/utils";

interface OkcRawInfo {
  blockHash: string;
  height: string;
  contractAddress: string | null;
  from: string;
  to: string | null;
  txId: string;
  amount: string;
  transactionTime: string;
  txFee: string;

  effectiveGasPrice: string;
  transactionHash: string;
  gasUsed: string;
  status: boolean;
  blockNumber: string | undefined;
  gas: string;
}

const getAddressActivity = async (
  address: string,
  endpoint: string
): Promise<EthereumRawInfo[]> => {
  return fetch(endpoint + address, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Ok-Access-Key": "cdc4e1f0-a147-46af-9aa9-179b08c27fd3",
    },
  })
    .then((res) => res.json())
    .then((res) => {
      const results = res.data[0].transactionLists as OkcRawInfo[];
      const newResults = results.reverse().map((tx) => {
        const rawTx: EthereumRawInfo = {
          blockHash: tx.blockHash,
          blockNumber: numberToHex(tx.height),
          contractAddress: "",
          data: "0x0",
          effectiveGasPrice: "0",
          from: tx.from,
          to: tx.to === "" ? null : tx.to,
          gas: "0x0",
          gasUsed: tx.txFee,
          nonce: numberToHex(0),
          status: true,
          transactionHash: tx.txId,
          value: toBase(tx.amount, 18),
          timestamp: parseInt(tx.transactionTime),
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
