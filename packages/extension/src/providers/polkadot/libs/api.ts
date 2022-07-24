import { ProviderAPIInterface } from "@/types/provider";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { PolkadotAPIOptions } from "../types";
import { AccountInfoWithRefCount } from "@polkadot/types/interfaces";
import { NetworkEndpoints } from "./activity-handlers/providers/subscan/configs";
import { SubscanExtrinsicInfo } from "@/types/activity";
class API implements ProviderAPIInterface {
  node: string;
  decimals: number;
  name: string;
  api!: ApiPromise;
  constructor(node: string, options: PolkadotAPIOptions) {
    this.node = node;
    this.decimals = options.decimals;
    this.name = options.name;
  }
  init(): Promise<void> {
    const provider = new WsProvider(this.node);
    return ApiPromise.create({ provider }).then((api) => {
      this.api = api;
    });
  }
  async getTransactionStatus(
    hash: string
  ): Promise<SubscanExtrinsicInfo | null> {
    const endpoint =
      NetworkEndpoints[this.name as keyof typeof NetworkEndpoints];
    if (!endpoint)
      throw new Error(
        "substrate-api: no handlers found to get transaction status"
      );

    const status: { code: number; message: string; data: any } = await fetch(
      `${endpoint}api/scan/extrinsic`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hash,
          events_limit: 1,
        }),
      }
    )
      .then((res) => res.json())
      .catch(() => null);
    if (!status.data || status.message !== "Success") return null;
    return status.data as SubscanExtrinsicInfo;
  }
  async getBalance(address: string): Promise<string> {
    const { data: balance } =
      await this.api.query.system.account<AccountInfoWithRefCount>(address);
    return balance.free.toString();
  }
}
export default API;
