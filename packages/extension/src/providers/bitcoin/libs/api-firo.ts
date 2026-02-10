import { BTCRawInfo } from '@/types/activity';
import { ProviderAPIInterface } from '@/types/provider';
import {
  BitcoinNetworkInfo,
  FiroTxType,
  FiroUnspentType,
  HaskoinUnspentType,
} from '../types';
import { getAddress as getBitcoinAddress } from '../types/bitcoin-network';
import { BaseFiroWallet } from './firo-wallet/base-firo-wallet';
import { toBN } from 'web3-utils';
import cacheFetch from '@/libs/cache-fetch';

class API implements ProviderAPIInterface {
  node: string;
  networkInfo: BitcoinNetworkInfo;
  #wallet: BaseFiroWallet;

  constructor(node: string, networkInfo: BitcoinNetworkInfo) {
    this.node = node;
    this.networkInfo = networkInfo;
    this.#wallet = new BaseFiroWallet();
  }

  public get api() {
    return this;
  }

  private getAddress(pubkey: string) {
    return getBitcoinAddress(pubkey, this.networkInfo);
  }

  async init(): Promise<void> {}

  async getRawTransaction(hash: string): Promise<string | null> {
    return fetch(`${this.node}/insight-api-zcoin/rawtx/${hash}`)
      .then(res => res.json())
      .then((tx: { hex: string; error: unknown }) => {
        if ((tx as any).error) return null;
        if (!tx.hex) return null;
        return `0x${tx.hex}`;
      });
  }
  async getTransactionStatus(hash: string): Promise<BTCRawInfo | null> {
    return fetch(`${this.node}/insight-api-zcoin/tx/${hash}`)
      .then(res => res.json())
      .then((tx: FiroTxType) => {
        if ((tx as any).message) return null;
        if (tx.blockheight < 0) return null;
        const rawInfo: BTCRawInfo = {
          blockNumber: tx.blockheight,
          fee: Number(tx.fees),
          inputs: tx.vin
            .filter(t => t.addresses && t.addresses.length)
            .map(input => ({
              address: input.addresses![0],
              value: Number(input.value),
            })),
          outputs: tx.vout
            .filter(
              t => t.scriptPubKey.addresses && t.scriptPubKey.addresses.length,
            )
            .map(output => ({
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
      .then(res => res.json())
      .then(
        (balance: { balanceSat: string }) => {
          if ((balance as any).message) return '0';
          return toBN(balance.balanceSat).toString();
        },
      )
      .catch(() => '0');
  }

  async broadcastTx(rawtx: string): Promise<{ txid: string }> {
    return fetch(`${this.node}/insight-api-zcoin/tx/send`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rawtx }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.error) {
          return Promise.reject(response.message);
        }
        return response;
      });
  }

  async FiroToHaskoinUTXOs(
    FiroUTXOs: FiroUnspentType[],
  ): Promise<HaskoinUnspentType[]> {
    const ret: HaskoinUnspentType[] = [];
    for (const utx of FiroUTXOs) {
      if (utx.confirmations === 0) continue;
      try {
        const rawTxRes = (await cacheFetch({
          url: `${this.node}/insight-api-zcoin/rawtx/${utx.txid}`,
        })) as { rawtx: string };
        const res = (await cacheFetch({
          url: `${this.node}/insight-api-zcoin/tx/${utx.txid}`,
        })) as FiroTxType;

        ret.push({
          address: utx.address,
          block: {
            height: res.blockheight,
            position: 0,
          },
          index: utx.vout,
          pkscript: 'res.vout[utx.vout].scriptPubKey.hex',
          txid: utx.txid,
          value: Number(utx.satoshis),
          raw: rawTxRes.rawtx,
        });
      } catch (error) {
        console.log(123, error);
      }
    }
    ret.sort((a, b) => {
      return a.value - b.value;
    });
    return ret;
  }

  async getUTXOs(pubkey: string): Promise<HaskoinUnspentType[]> {
    const address = pubkey.length < 64 ? pubkey : this.getAddress(pubkey);

    return fetch(`${this.node}/insight-api-zcoin/addr/${address}/utxo`)
      .then(res => {
        return res.json();
      })
      .then(async (utxos: FiroUnspentType[]) => {
        if ((utxos as any).message || !utxos.length) return [];
        return await this.FiroToHaskoinUTXOs(utxos);
      });
  }
}
export default API;
