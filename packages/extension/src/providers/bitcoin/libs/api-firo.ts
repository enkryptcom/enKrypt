import cacheFetch from '@/libs/cache-fetch';
import { BTCRawInfo } from '@/types/activity';
import { ProviderAPIInterface } from '@/types/provider';
import {
  BitcoinNetworkInfo,
  FiroTxType,
  FiroUnspentType,
  HaskoinUnspentType,
} from '../types';
import { getAddress as getBitcoinAddress } from '../types/bitcoin-network';
import { Utxo } from '../types/utxo';
import { PublicFiroWallet } from './firo-wallet/public-firo-wallet';

class API implements ProviderAPIInterface {
  node: string;
  networkInfo: BitcoinNetworkInfo;
  #wallet: PublicFiroWallet;

  constructor(node: string, networkInfo: BitcoinNetworkInfo) {
    this.node = node;
    this.networkInfo = networkInfo;
    this.#wallet = new PublicFiroWallet();
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
    return this.#wallet
      .getPublicBalance()
      .then(balance => balance.toString())
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
    address: string,
  ): Promise<HaskoinUnspentType[]> {
    const ret: HaskoinUnspentType[] = [];
    for (const utx of FiroUTXOs) {
      try {
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

  async getUTXOs(pubkey: string): Promise<Utxo[]> {
    const spendableUtxos = await this.#wallet.getOnlySpendableUtxos();

    if ((spendableUtxos as any).message || !spendableUtxos.length) return [];
    spendableUtxos.sort((a, b) => {
      return a.amount - b.amount;
    });

    return spendableUtxos.map(el => ({
      ...el,
      value: el.satoshis,
    }));
  }
}
export default API;
