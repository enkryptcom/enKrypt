import { BTCRawInfo } from '@/types/activity';
import { ProviderAPIInterface } from '@/types/provider';
import { BitcoinNetworkInfo, FiroTxType } from '../types';
import { getAddress as getBitcoinAddress } from '../types/bitcoin-network';
import { BaseFiroWallet } from './firo-wallet/base-firo-wallet';
import { UnspentTxOutputModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';

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
    return this.#wallet
      .getPublicBalance()
      .then(balance => balance.toString())
      .catch(() => '0');
  }

  async broadcastTxRPC(rawtx: string): Promise<{ txid: string }> {
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

  async broadcastTx(txHex: string): Promise<{ txid: string }> {
    const txid = await this.#wallet.broadcastTransaction(txHex);
    return { txid };
  }

  async getUTXOs(pubkey: string): Promise<UnspentTxOutputModel[]> {
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
