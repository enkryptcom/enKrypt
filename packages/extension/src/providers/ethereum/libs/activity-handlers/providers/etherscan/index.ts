import cacheFetch from "@/libs/cache-fetch";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import { Activity, ActivityStatus, EthereumRawInfo } from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
import { decodeTx } from "../../../transaction/decoder";
import { NetworkEndpoints } from "./configs";
const TTL = 30000;
const getAddressActivity = async (
  address: string,
  endpoint: string
): Promise<EthereumRawInfo[]> => {
  const transactions = cacheFetch({
    url: `${endpoint}api?module=account&action=txlist&address=${address}`,
  })
    .then((res) => res.json())
    .then((res) => res.result.items as EthereumRawInfo[]);
};
export default async (
  network: BaseNetwork,
  address: string
): Promise<Activity[]> => {
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
        status:
          activity.status === "0x1"
            ? ActivityStatus.success
            : ActivityStatus.failed,
        timestamp: 0,
        value: txData.tokenValue,
        transactionHash: activity.transactionHash,
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
