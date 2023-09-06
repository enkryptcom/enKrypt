import {
  EthereumRawInfo,
  SubscanExtrinsicInfo,
  BTCRawInfo,
} from "@/types/activity";
import { ProviderAPIInterface } from "@/types/provider";

class API implements ProviderAPIInterface {
  node: string;
  decimals: number;
  name: string;

  constructor(node: string) {
    this.node = node;
    this.decimals = 18;
    this.name = "Kadena";
  }

  public get api() {
    return this;
  }

  init(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  getTransactionStatus(
    hash: string
  ): Promise<EthereumRawInfo | SubscanExtrinsicInfo | BTCRawInfo | null> {
    throw new Error("Method not implemented.");
  }

  async getBalance(address: string): Promise<string> {
    return "0";
  }
}

export default API;
