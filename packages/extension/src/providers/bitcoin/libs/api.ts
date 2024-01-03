import { BTCRawInfo } from "@/types/activity";
import { ProviderAPIInterface } from "@/types/provider";
import {
  BitcoinNetworkInfo,
  HaskoinBalanceType,
  HaskoinTxType,
  HaskoinUnspentType,
} from "../types";
import { toBN } from "web3-utils";
import { getAddress as getBitcoinAddress } from "../types/bitcoin-network";

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
    return getBitcoinAddress(pubkey, this.networkInfo);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init(): Promise<void> {}
  async getTransactionStatus(hash: string): Promise<BTCRawInfo | null> {
    return fetch(`${this.node}transaction/${hash}`)
      .then((res) => res.json())
      .then((tx: HaskoinTxType) => {
        if ((tx as any).error) return null;
        if (tx.block.mempool) return null;
        const rawInfo: BTCRawInfo = {
          blockNumber: tx.block.height!,
          fee: tx.fee,
          inputs: tx.inputs.map((input) => ({
            address: input.address,
            value: input.value,
          })),
          outputs: tx.outputs.map((output) => ({
            address: output.address,
            value: output.value,
          })),
          transactionHash: tx.txid,
          timestamp: tx.time * 1000,
        };
        return rawInfo;
      });
  }
  async getBalance(pubkey: string): Promise<string> {
    const address = pubkey.length < 64 ? pubkey : this.getAddress(pubkey);
    return fetch(`${this.node}address/${address}/balance`)
      .then((res) => res.json())
      .then((balance: HaskoinBalanceType) => {
        if ((balance as any).error) return "0";
        return toBN(balance.confirmed).addn(balance.unconfirmed).toString();
      })
      .catch(() => "0");
  }
  async broadcastTx(rawtx: string): Promise<boolean> {
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
        if (response.error) {
          if (response.error === "server-error") return true; // haskoin api return error when it timesout or something
          return Promise.reject(response.message);
        }
        return true;
      });
  }
  async getUTXOs(pubkey: string): Promise<HaskoinUnspentType[]> {
    const address = pubkey.length < 64 ? pubkey : this.getAddress(pubkey);
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
