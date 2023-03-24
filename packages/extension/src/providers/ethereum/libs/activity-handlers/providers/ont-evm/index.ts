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

interface OntEvmRawInfo {
  tx_hash: string;
  tx_time: string;
  block_height: string;
  fee: string;
  confirm_flag: number;

  contractAddress: string | null;
  from: string | null;
  to: string | null;
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
      const results = res.data[0].transactionLists as OntEvmRawInfo[];
      const newResults = results.reverse().map((tx) => {
        const rawTx: EthereumRawInfo = {
          blockHash: "",
          blockNumber: numberToHex(tx.block_height),
          contractAddress: "",
          data: "0x0",
          effectiveGasPrice: "0",
          from: address,
          to: tx.to === "" ? null : tx.to,
          gas: "0x0",
          gasUsed: tx.fee,
          nonce: numberToHex(0),
          status: true,
          transactionHash: tx.tx_hash,
          value: "",
          timestamp: parseInt(tx.tx_time),
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
