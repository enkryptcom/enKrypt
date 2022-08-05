import { EthereumRawInfo } from "@/types/activity";
import { ProviderAPIInterface } from "@/types/provider";

class API implements ProviderAPIInterface {
  node: string;

  constructor(node: string) {
    this.node = node;
  }

  public get api() {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}
  async getTransactionStatus(hash: string): Promise<EthereumRawInfo | null> {
    console.log("bitcoin api", hash);
    return null;
  }
  async getBalance(address: string): Promise<string> {
    console.log("bitcoin api", address);
    return "0";
  }
}
export default API;
