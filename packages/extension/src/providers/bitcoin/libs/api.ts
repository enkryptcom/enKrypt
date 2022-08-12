import { EthereumRawInfo } from "@/types/activity";
import { ProviderAPIInterface } from "@/types/provider";
import { hexToBuffer } from "@enkryptcom/utils";
import {
  BitcoinNetworkInfo,
  HaskoinBalanceType,
  HaskoinUnspentType,
} from "../types";
import { payments } from "bitcoinjs-lib";
import { toBN } from "web3-utils";

class API implements ProviderAPIInterface {
  node: string;
  networkInfo: BitcoinNetworkInfo;

  constructor(node: string, networkInfo: BitcoinNetworkInfo) {
    this.node = node;
    this.networkInfo = networkInfo;
  }

  public get api() {
    return this;
  }
  private getAddress(pubkey: string) {
    const { address } = payments.p2wpkh({
      pubkey: hexToBuffer(pubkey),
      network: this.networkInfo,
    });
    return address as string;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}
  async getTransactionStatus(hash: string): Promise<EthereumRawInfo | null> {
    console.log("bitcoin api", hash);
    return null;
  }
  async getBalance(pubkey: string): Promise<string> {
    const address = this.getAddress(pubkey);
    return fetch(`${this.node}address/${address}/balance`)
      .then((res) => res.json())
      .then((balance: HaskoinBalanceType) => {
        if ((balance as any).error) return "0";
        return toBN(balance.confirmed).addn(balance.unconfirmed).toString();
      });
  }
  async broadcastTx(rawtx: string): Promise<string> {
    console.log(`${this.node}transactions`, rawtx);
    axios({
      method: "post",
      url: `${this.node}transactions`,
      data: rawtx,
    }).then(console.log);
    return fetch(`${this.node}transactions`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "text/plain",
      },
      body: rawtx,
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response);
        if (response.error) return Promise.reject(response.message);
        return response.txid as string;
      });
  }
  async getUTXOs(pubkey: string): Promise<HaskoinUnspentType[]> {
    const address = this.getAddress(pubkey);
    return fetch(`${this.node}address/${address}/unspent`)
      .then((res) => res.json())
      .then((utxos: HaskoinUnspentType[]) => {
        if ((utxos as any).error) return [];
        utxos.sort((a, b) => {
          return a.value - b.value;
        });
        return utxos;
      });
  }
}
export default API;
