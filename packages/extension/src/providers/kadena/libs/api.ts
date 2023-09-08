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
  NETWORK_ID = "testnet04";
  CHAIN_ID = "1";
  API_HOST = `https://api.testnet.chainweb.com/chainweb/0.0/${this.NETWORK_ID}/chain/${this.CHAIN_ID}/pact`;
  KEY_PAIR = {
    publicKey: "",
    secretKey: "",
  };

  constructor(node: string) {
    this.node = node;
    this.decimals = 7;
    this.name = "Kadena";
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
    const balanceToString = balance.result.error
      ? "0".padEnd(7, "0")
      : balance.result.data
          .toString()
          .replace(".", "")
          .padEnd(7 + balance.result.data, "0");
    return balanceToString;
  }

  async getBalanceAPI(account: string) {
    const Pact = require("pact-lang-api");
    const cmd = {
      networkId: this.NETWORK_ID,
      pactCode: `(coin.get-balance "${account}")`,
      envData: {},
      meta: {
        creationTime: Math.round(new Date().getTime() / 1000),
        ttl: 600,
        gasLimit: 600,
        chainId: this.CHAIN_ID,
        gasPrice: 0.0000001,
        sender: this.KEY_PAIR.publicKey,
      },
    };

    return await Pact.fetch.local(cmd, this.API_HOST);
  }
}

export default API;
