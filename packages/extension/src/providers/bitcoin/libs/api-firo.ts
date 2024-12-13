import { BTCRawInfo } from "@/types/activity";
import { ProviderAPIInterface } from "@/types/provider";
import {
  BitcoinNetworkInfo,
  FiroTxType,
  FiroUnspentType,
  HaskoinUnspentType,
} from "../types";
import { toBN } from "web3-utils";
import cacheFetch from "@/libs/cache-fetch";
import { getAddress as getBitcoinAddress } from "../types/bitcoin-network";
import { filterOutOrdinals } from "./filter-ordinals";

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

  async getRawTransaction(hash: string): Promise<string | null> {
    return fetch(`${this.node}/insight-api-zcoin/rawtx/${hash}`)
      .then((res) => res.json())
      .then((tx: { hex: string; error: unknown }) => {
        if ((tx as any).error) return null;
        if (!tx.hex) return null;
        return `0x${tx.hex}`;
      });
  }
  async getTransactionStatus(hash: string): Promise<BTCRawInfo | null> {
    return fetch(`${this.node}/insight-api-zcoin/tx/${hash}`)
      .then((res) => res.json())
      .then((tx: FiroTxType) => {
        if ((tx as any).message) return null;
        if (tx.blockheight < 0) return null;
        const rawInfo: BTCRawInfo = {
          blockNumber: tx.blockheight,
          fee: Number(tx.fees),
          inputs: tx.vin
            .filter((t) => t.addresses && t.addresses.length)
            .map((input) => ({
              address: input.addresses![0],
              value: Number(input.value),
            })),
          outputs: tx.vout
            .filter(
              (t) => t.scriptPubKey.addresses && t.scriptPubKey.addresses.length
            )
            .map((output) => ({
              address: output.scriptPubKey.addresses![0],
              value: Number(output.value),
              pkscript: output.scriptPubKey.hex,
            })),
          transactionHash: tx.txid,
          timestamp: tx.time * 1000,
        };
        return rawInfo;
      });
  }

  async getBalance(pubkey: string): Promise<string> {
    const address = pubkey.length < 64 ? pubkey : this.getAddress(pubkey);
    return fetch(`${this.node}/insight-api-zcoin/addr/${address}/?noTxList=1`)
      .then((res) => res.json())
      .then(
        (balance: { balanceSat: string; unconfirmedBalanceSat: string }) => {
          if ((balance as any).message) return "0";
          return toBN(balance.balanceSat)
            .add(toBN(balance.unconfirmedBalanceSat))
            .toString();
        }
      )
      .catch(() => "0");
  }

  async broadcastTx(rawtx: string): Promise<boolean> {
    return fetch(`${this.node}/insight-api-zcoin/tx/send`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rawtx }),
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.error) {
          return Promise.reject(response.message);
        }
        return true;
      });
  }

  async FiroToHaskoinUTXOs(
    FiroUTXOs: FiroUnspentType[],
    address: string
  ): Promise<HaskoinUnspentType[]> {
    const ret: HaskoinUnspentType[] = [];
    for (const utx of FiroUTXOs) {
      const rawTxRes = (await cacheFetch({
        url: `${this.node}/insight-api-zcoin/rawtx/${utx.txid}`,
      })) as { rawtx: string };
      const res = (await cacheFetch({
        url: `${this.node}/insight-api-zcoin/tx/${utx.txid}`,
      })) as FiroTxType;

      ret.push({
        address,
        block: {
          height: res.blockheight,
          position: 0,
        },
        index: utx.vout,
        pkscript: res.vout[utx.vout].scriptPubKey.hex,
        txid: utx.txid,
        value: Number(utx.satoshis),
        raw: rawTxRes.rawtx,
      });
    }
    ret.sort((a, b) => {
      return a.value - b.value;
    });
    return [ret.at(-1)!]; // TODO: check or filter same values
  }

  async getUTXOs(pubkey: string): Promise<HaskoinUnspentType[]> {
    const address = pubkey.length < 64 ? pubkey : this.getAddress(pubkey);
    return fetch(`${this.node}/insight-api-zcoin/addr/${address}/utxo`)
      .then((res) => res.json())
      .then(async (utxos: FiroUnspentType[]) => {
        if ((utxos as any).message || !utxos.length) return [];
        return filterOutOrdinals(
          address,
          this.networkInfo.name,
          await this.FiroToHaskoinUTXOs(utxos, address)
        ).then((futxos) => {
          futxos.sort((a, b) => {
            return a.value - b.value;
          });
          return futxos;
        });
      });
  }
}
export default API;
