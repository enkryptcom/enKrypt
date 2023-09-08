import {
  EthereumRawInfo,
  SubscanExtrinsicInfo,
  BTCRawInfo,
} from "@/types/activity";
import { ProviderAPIInterface } from "@/types/provider";
import { KadenaApiOptions } from "../types";

class API implements ProviderAPIInterface {
  node: string;
  decimals: number;
  name: string;
  networkId: string;
  chainId: string;
  apiHost: string;
  keyPair = {
    publicKey: "",
    secretKey: "",
  };

  constructor(node: string, options: KadenaApiOptions) {
    this.decimals = 7;
    this.name = "Kadena";

    this.node = node;
    this.networkId = options.networkId;
    this.chainId = options.chainId;
    this.apiHost = `${node}/${this.networkId}/chain/${this.chainId}/pact`;
  }

  public get api() {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}

  getTransactionStatus(
    hash: string
  ): Promise<EthereumRawInfo | SubscanExtrinsicInfo | BTCRawInfo | null> {
    throw new Error("Method not implemented.");
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.getBalanceAPI(address);

    if (balance.result.error) {
      return "0".padEnd(7, "0");
    }

    const balanceValue = balance.result.data.toString();

    const balanceInt = balanceValue.substring(
      0,
      balance.result.data.toString().indexOf(".")
    );

    const balanceToString = balanceValue
      .replace(".", "")
      .padEnd(7 + balanceInt.toString().length, "0");

    return balanceToString;
  }

  async getBalanceAPI(account: string) {
    const Pact = require("pact-lang-api");
    const cmd = {
      networkId: this.networkId,
      pactCode: `(coin.get-balance "${account}")`,
      envData: {},
      meta: {
        creationTime: Math.round(new Date().getTime() / 1000),
        ttl: 600,
        gasLimit: 600,
        chainId: this.chainId,
        gasPrice: 0.0000001,
        sender: this.keyPair.publicKey,
      },
    };

    return await Pact.fetch.local(cmd, this.apiHost);
  }
}

export default API;
