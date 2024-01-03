import { BTCRawInfo } from "@/types/activity";
import { ProviderAPIInterface } from "@/types/provider";
import {
  BitcoinNetworkInfo,
  HaskoinUnspentType,
  SSTxType,
  SSUnspentType,
} from "../types";
import { toBN } from "web3-utils";
import cacheFetch from "@/libs/cache-fetch";
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
    return fetch(`${this.node}/api/v1/tx/${hash}`)
      .then((res) => res.json())
      .then((tx: SSTxType) => {
        if ((tx as any).message) return null;
        if (tx.blockHeight < 0) return null;
        const rawInfo: BTCRawInfo = {
          blockNumber: tx.blockHeight,
          fee: Number(tx.fee),
          inputs: tx.vin
            .filter((t) => t.addresses && t.addresses.length)
            .map((input) => ({
              address: input.addresses![0],
              value: Number(input.value),
            })),
          outputs: tx.vout
            .filter((t) => t.addresses && t.addresses.length)
            .map((output) => ({
              address: output.addresses![0],
              value: Number(output.value),
            })),
          transactionHash: tx.txid,
          timestamp: tx.timestamp * 1000,
        };
        return rawInfo;
      });
  }
  async getBalance(pubkey: string): Promise<string> {
    const address = pubkey.length < 64 ? pubkey : this.getAddress(pubkey);
    return fetch(`${this.node}/api/v1/account/${address}`)
      .then((res) => res.json())
      .then((balance: { balance: string; unconfirmedBalance: string }) => {
        if ((balance as any).message) return "0";
        return toBN(balance.balance)
          .add(toBN(balance.unconfirmedBalance))
          .toString();
      })
      .catch(() => "0");
  }
  async broadcastTx(rawtx: string): Promise<boolean> {
    return fetch(`${this.node}/api/v1/send`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hex: rawtx }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.error) {
          return Promise.reject(response.message);
        }
        return true;
      });
  }
  async SSToHaskoinUTXOs(
    SSUTXOs: SSUnspentType[],
    address: string
  ): Promise<HaskoinUnspentType[]> {
    const ret: HaskoinUnspentType[] = [];
    for (const utx of SSUTXOs) {
      const res = (await cacheFetch({
        url: `${this.node}/api/v1/tx/${utx.txid}`,
      })) as SSTxType;
      ret.push({
        address,
        block: {
          height: utx.height,
          position: 0,
        },
        index: utx.vout,
        pkscript: res.vout[utx.vout].scriptPubKey.hex,
        txid: utx.txid,
        value: Number(utx.value),
        raw: res.hex,
      });
    }
    ret.sort((a, b) => {
      return a.value - b.value;
    });
    return ret;
  }

  async getUTXOs(pubkey: string): Promise<HaskoinUnspentType[]> {
    const address = pubkey.length < 64 ? pubkey : this.getAddress(pubkey);
    return fetch(`${this.node}/api/v1/account/${address}/utxos`)
      .then((res) => res.json())
      .then((utxos: SSUnspentType[]) => {
        if ((utxos as any).message || !utxos.length) return [];
        return this.SSToHaskoinUTXOs(utxos, address);
      });
  }
}
export default API;
