import { ProviderAPIInterface } from "@/types/provider";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { PolkadotAPIOptions } from "../types";
import { AccountInfoWithRefCount } from "@polkadot/types/interfaces";
class API implements ProviderAPIInterface {
  node: string;
  decimals: number;
  api!: ApiPromise;
  constructor(node: string, options: PolkadotAPIOptions) {
    this.node = node;
    this.decimals = options.decimals;
  }
  init(): Promise<void> {
    const provider = new WsProvider(this.node);
    return ApiPromise.create({ provider }).then((api) => {
      this.api = api;
    });
  }
  async getBalance(address: string): Promise<string> {
    const { data: balance } =
      await this.api.query.system.account<AccountInfoWithRefCount>(address);
    return balance.free.toString();
  }
}
export default API;
