import { BTCRawInfo } from '@/types/activity';
import { ProviderAPIInterface } from '@/types/provider';
import { BitcoinNetworkInfo, FiroTxType } from '../types';
import { getAddress as getBitcoinAddress } from '../types/bitcoin-network';
import { BaseFiroWallet } from './firo-wallet/base-firo-wallet';
import { UnspentTxOutputModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { ECPairInterface } from 'ecpair';
import { Transaction as FTransaction } from 'bitcoinjs-lib-firo';

class API implements ProviderAPIInterface {
  node: string;
  networkInfo: BitcoinNetworkInfo;
  #wallet: BaseFiroWallet;
  #balancePromise: Promise<string> | null = null;

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
      .then((tx: { rawtx: string; error: unknown }) => {
        if (tx.error) return null;
        if (!tx.rawtx) return null;
        return tx.rawtx;
      })
      .catch(() => null);
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
      })
      .catch(() => null);
  }

  async getBalance(): Promise<string> {
    if (this.#balancePromise) return this.#balancePromise;
    this.#balancePromise = this.getUTXOs('')
      .then(utxos =>
        utxos.reduce((sum, utxo) => sum + utxo.satoshis, 0).toString(),
      )
      .catch(err => {
        console.error('Firo getBalance failed:', err);
        return '0';
      })
      .finally(() => {
        this.#balancePromise = null;
      });
    return this.#balancePromise;
  }

  /** Fetches UTXOs for all addresses in a single bulk HTTP request
   * (the insight API only exposes per-address balance, not bulk balance). */
  async #fetchBulkUtxos(addresses: string[]): Promise<
    {
      address: string;
      txid: string;
      vout: number;
      scriptPubKey: string;
      amount: number;
      satoshis: number;
      height?: number;
      confirmations: number;
    }[]
  > {
    if (!addresses.length) return [];
    const res = await fetch(
      `${this.node}/insight-api-zcoin/addrs/${addresses.join(',')}/utxo`,
    );
    const utxos = await res.json();
    if (!Array.isArray(utxos)) throw new Error('Invalid bulk UTXO response');
    return utxos;
  }

  async getAddressBalance(addresses: string[]): Promise<string | null> {
    try {
      const utxos = await this.#fetchBulkUtxos(addresses);
      const balanceSat = utxos.reduce((sum, utxo) => {
        if (utxo.confirmations > 0) return sum + utxo.satoshis;
        return sum;
      }, 0);
      return balanceSat.toString();
    } catch {
      return null;
    }
  }

  async #getUTXOsViaHTTP(): Promise<UnspentTxOutputModel[]> {
    const addresses = await this.#wallet.getTransactionsAddresses();
    const utxos = (await this.#fetchBulkUtxos(addresses)).filter(
      u => u.confirmations > 0,
    );
    if (!utxos.length) return [];

    const uniqueTxids = [...new Set(utxos.map(u => u.txid))];
    const rawTxs = await Promise.all(
      uniqueTxids.map(txid => this.getRawTransaction(txid)),
    );
    const rawByTxid = new Map(uniqueTxids.map((txid, i) => [txid, rawTxs[i]]));

    return utxos.map(u => {
      const raw = rawByTxid.get(u.txid);
      if (!raw) throw new Error(`Missing raw tx for ${u.txid}`);
      if (FTransaction.fromHex(raw).getId() !== u.txid) {
        throw new Error(`Raw tx hash mismatch for ${u.txid}`);
      }
      return {
        txid: u.txid,
        vout: u.vout,
        index: u.vout,
        satoshis: u.satoshis,
        amount: u.amount,
        height: u.height ?? 0,
        confirmations: u.confirmations,
        address: u.address,
        scriptPubKey: u.scriptPubKey,
        raw,
      };
    });
  }

  async broadcastTx(rawtx: string): Promise<{ txid: string }> {
    try {
      const res = await fetch(`${this.node}/insight-api-zcoin/tx/send`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawtx }),
      });
      const response = await res.json();
      if (response.error) throw new Error(response.message);
      return response;
    } catch (err) {
      console.error(
        'Firo broadcastTx via explorer API failed, falling back to electrum:',
        err,
      );
      try {
        const txid = await this.#wallet.broadcastTransaction(rawtx);
        return { txid };
      } catch (electrumErr) {
        console.error('Firo broadcastTx electrum fallback failed:', electrumErr);
        return Promise.reject(err);
      }
    }
  }

  async broadcastTxElectrum(txHex: string): Promise<{ txid: string }> {
    const txid = await this.#wallet.broadcastTransaction(txHex);
    return { txid };
  }

  async getSpendableUtxosWithKeyPairs(): Promise<{
    spendableUtxos: (UnspentTxOutputModel & { keyPair: ECPairInterface })[];
    addressKeyPairs: Record<string, ECPairInterface>;
  }> {
    const addresses = await this.#wallet.getTransactionsAddresses();
    const [utxos, addressKeyPairs] = await Promise.all([
      this.getUTXOs(''),
      this.#wallet.getAddressKeyPairMapping(addresses),
    ]);

    const spendableUtxos = utxos.map(utxo => ({
      ...utxo,
      keyPair: addressKeyPairs[utxo.address],
    }));

    return { spendableUtxos, addressKeyPairs };
  }

  async getUTXOs(): Promise<UnspentTxOutputModel[]> {
    let spendableUtxos: UnspentTxOutputModel[];
    try {
      spendableUtxos = await this.#getUTXOsViaHTTP();
    } catch (err) {
      console.error(
        'Firo getUTXOs via HTTP failed, falling back to electrum:',
        err,
      );
      spendableUtxos = await this.#wallet.getOnlySpendableUtxos();
    }

    if ((spendableUtxos as any).message || !spendableUtxos.length) return [];
    spendableUtxos.sort((a, b) => {
      return a.amount - b.amount;
    });

    return spendableUtxos.map(el => ({
      ...el,
      index: el.vout,
      value: el.satoshis,
    }));
  }
}
export default API;
