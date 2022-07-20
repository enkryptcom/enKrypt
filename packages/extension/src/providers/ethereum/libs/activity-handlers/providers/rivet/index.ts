import cacheFetch from "@/libs/cache-fetch";
import { getNetworkByName } from "@/libs/utils/networks";
import {
  Activity,
  ActivityHandler,
  ActivityStatus,
  EthereumRawInfo,
} from "@/types/activity";
import { BaseNetwork } from "@/types/base-network";
import { NetworkNames } from "@enkryptcom/types";
import { NetworkEndpoints } from "./configs";

class RivetActivity implements ActivityHandler {
  public address: string;
  public network: BaseNetwork;
  constructor(networkName: NetworkNames, address: string) {
    this.address = address;
    this.network = getNetworkByName(networkName)!;
  }
  async getAllActivity(): Promise<Activity[]> {
    const enpoint =
      NetworkEndpoints[this.network.name as keyof typeof NetworkEndpoints];
    const activities = await this.getAddressActivity(enpoint);
    const activity: Activity = {
      from: "",
      to: "",
      isIncoming: false,
      network: this.network.name,
      rawInfo: null,
      status: ActivityStatus.failed,
      timestamp: 54545,
      token: {
        decimals: 18,
        icon: "",
        name: "",
        symbol: "",
        coingeckoID: "",
      },
    };
    return [];
  }
  private async getAddressActivity(
    endpoint: string
  ): Promise<EthereumRawInfo[]> {
    const transactions = fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: 0,
        method: "flume_getTransactionsByParticipant",
        params: [this.address],
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
        params: [this.address],
      }),
    })
      .then((res) => res.json())
      .then((res) => res.result.items as EthereumRawInfo[]);
    return Promise.all([transactions, transactionsReceipts]).then(
      (responses) => {
        const allInfo = responses[0].map((item) => {
          const receipt = responses[1].find(
            (r) => r.transactionHash === (item as any).hash
          );
          if (receipt) return { ...item, ...receipt };
          return null;
        });
        return allInfo.filter((i) => i !== null) as EthereumRawInfo[];
      }
    );
  }
}
