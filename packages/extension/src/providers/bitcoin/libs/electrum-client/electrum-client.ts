import ElectrumClient from 'electrum-client-browser';
import {
  AnonymitySetMetaModel,
  BalanceModel,
  FullTransactionModel,
  TransactionModel,
  UsedSerialsModel,
  type AnonymitySetModel,
} from './abstract-electrum';

import * as bitcoin from 'bitcoinjs-lib';

const networkInfo = {
  messagePrefix: '\x18Zcoin Signed Message:\n',
  bech32: 'bc',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x52,
  scriptHash: 0x07,
  wif: 0xd2,
};

type Peer = {
  host: string;
  tcp: string | null;
  ssl: string | null;
};

const hardcodedPeers: Peer[] = [
  { host: 'electrumx.firo.org', tcp: '50001', ssl: '50002' },
  { host: 'electrumx01.firo.org', tcp: '50001', ssl: '50002' },
  { host: 'electrumx02.firo.org', tcp: '50001', ssl: '50002' },
  { host: 'electrumx03.firo.org', tcp: '50001', ssl: '50002' },
];

/**
 * Returns random hardcoded electrum server guaranteed to work
 * at the time of writing.
 *
 * @returns {Promise<{tcp, host}|*>}
 */
function getRandomHardcodedPeer(): Peer {
  const index = Math.ceil(hardcodedPeers.length * Math.random()) - 1;
  return hardcodedPeers[index];
}

export default class FiroElectrum {
  mainClient?: ElectrumClient = undefined;
  mainConnected = false;
  wasConnectedAtLeastOnce = false;
  serverName = false;

  latestBlockheight: number | false = false;
  latestBlockheightTimestamp: number = 0;

  txhashHeightCache: Map<string, number> = new Map();

  listeners: Array<() => void> = [];

  private all_anonymity_sets_meta: AnonymitySetMetaModel[] = [];

  getLatestBlockHeight(): number {
    return this.latestBlockheight === false ? -1 : this.latestBlockheight;
  }

  async getCoinIDs(coinHashes: string[]) {
    return this.mainClient
      ?.request('spark.getsparkmintmetadata', [
        {
          coinHashes: coinHashes,
        },
      ])
      .catch(error => {
        console.error(
          'electrum_wallet:getCoinIDs',
          'Failed to fetch coin IDs:',
          error,
        );
        throw new Error(error);
      });
  }

  async connectMain() {
    try {
      const peer = getRandomHardcodedPeer();
      this.mainClient = new ElectrumClient(peer.host, 50004, 'wss');

      await this.mainClient.connect('electrum-client-browser', '1.4');

      this.wasConnectedAtLeastOnce = true;
    } catch (e) {
      this.mainClient = undefined;
      console.error('electrum_wallet:connectMain', e);
      if (!this.mainClient) {
        console.warn('electrum_wallet:connectMain', 'retry');
        setTimeout(() => {
          this.connectMain();
        }, 5000);
      }
    }
  }

  async disconnect() {
    try {
      await this.mainClient?.close();

      this.wasConnectedAtLeastOnce = false;
    } catch (e) {
      console.error('electrum_wallet:disconnect', e);
    }
  }

  addChangeListener(onChange: () => void): void {
    this.listeners.push(onChange);
  }

  removeChangeListener(onChange: () => void): void {
    this.listeners = this.listeners.filter(listener => {
      return listener !== onChange;
    });
  }

  async getBalanceByAddress(
    address: string,
  ): Promise<Omit<BalanceModel, 'addresses'>> {
    const script = bitcoin.address.toOutputScript(address, networkInfo);
    const hash = bitcoin.crypto.sha256(script);

    const reversedHash = Buffer.from(hash.reverse());
    const balance = await this.mainClient!.blockchain_scripthash_getBalance(
      reversedHash.toString('hex'),
    );

    return balance;
  }

  async getTransactionsByAddress(
    address: string,
  ): Promise<Array<TransactionModel>> {
    const script = this.addressToScript(address);
    const hash = bitcoin.crypto.sha256(Buffer.from(script));

    const reversedHash = Buffer.from(hash.reverse());
    const history = await this.mainClient?.blockchain_scripthash_getHistory(
      reversedHash.toString('hex'),
    );
    // for (const h of history || []) {
    //   if (h.tx_hash) txhashHeightCache[h.tx_hash] = h.height; // cache tx height
    // }
    return history as TransactionModel[];
  }

  // async multiGetTransactionsByAddress(
  //   addresses: Array<string>,
  //   batchsize: number = 200,
  // ): Promise<{ [address: string]: TransactionModel[] }> {
  //   this.checkConnection('multiGetTransactionsByAddress');

  //   const ret: { [address: string]: TransactionModel[] } = {};

  //   const chunks = splitIntoChunks(addresses, batchsize);
  //   for (const chunk of chunks) {
  //     const scripthashes = [];
  //     const scripthash2addr: { [revHash: string]: string } = {};
  //     for (const addr of chunk) {
  //       const script = bitcoin.address.toOutputScript(addr, firo.networkInfo);
  //       const hash = bitcoin.crypto.sha256(script);

  //       const reversedHash = Buffer.from(reverse(hash));
  //       const reversedHashHex = reversedHash.toString('hex');
  //       scripthashes.push(reversedHashHex);
  //       scripthash2addr[reversedHashHex] = addr;
  //     }

  //     const results = [];

  //     for (const sh of scripthashes) {
  //       const res = await this.mainClient.blockchainScripthash_getHistory(sh);

  //       results.push(res);
  //     }

  //     for (const history of results) {
  //       if (history.error) {
  //         console.warn(
  //           'electrum_wallet:multiGetTransactionsByAddress',
  //           history.error,
  //         );
  //       }
  //       if (history?.result?.length > 0) {
  //         ret[scripthash2addr[history.param]] = history.result;
  //       }
  //     }
  //   }

  //   return ret;
  // }

  async getTransactionsFullByAddress(
    address: string,
  ): Promise<Array<FullTransactionModel>> {
    const txs = await this.getTransactionsByAddress(address);
    const ret = [];
    for (const tx of txs) {
      const full = await this.mainClient?.blockchain_transaction_get(
        tx.tx_hash,
        true,
      );
      full.address = address;
      for (const input of full.vin) {
        // now we need to fetch previous TX where this VIN became an output, so we can see its amount
        const prevTxForVin = await this.mainClient?.blockchain_transaction_get(
          input.txid,
          true,
        );
        if (
          prevTxForVin &&
          prevTxForVin.vout &&
          prevTxForVin.vout[input.vout]
        ) {
          input.value = prevTxForVin.vout[input.vout].value;
          // also, we extract destination address from prev output:
          if (
            prevTxForVin.vout[input.vout].scriptPubKey &&
            prevTxForVin.vout[input.vout].scriptPubKey.addresses
          ) {
            input.addresses =
              prevTxForVin.vout[input.vout].scriptPubKey.addresses;
          }
        }
      }

      for (const output of full.vout) {
        if (output.scriptPubKey && output.scriptPubKey.addresses) {
          output.addresses = output.scriptPubKey.addresses;
        }
      }
      full.inputs = full.vin;
      full.outputs = full.vout;
      // delete full.vin;
      // delete full.vout;
      // delete full.hex; // compact
      // delete full.hash; // compact
      ret.push(full);
    }
    return ret;
  }

  // async multiGetBalanceByAddress(
  //   addresses: Array<string>,
  //   batchsize: number = 200,
  // ): Promise<BalanceModel> {
  //   this.checkConnection('multiGetBalanceByAddress');

  //   const ret = new BalanceModel();

  //   const chunks = splitIntoChunks(addresses, batchsize);
  //   for (const chunk of chunks) {
  //     const scripthashes = [];
  //     const scripthash2addr: Map<string, string> = new Map();
  //     for (const addr of chunk) {
  //       const script = bitcoin.address.toOutputScript(addr, firo.networkInfo);
  //       const hash = bitcoin.crypto.sha256(script);

  //       const reversedHash = Buffer.from(reverse(hash));
  //       const reversedHashHex = reversedHash.toString('hex');
  //       scripthashes.push(reversedHashHex);
  //       scripthash2addr.set(reversedHashHex, addr);
  //     }

  //     let balances = [];

  //     balances =
  //       await this.mainClient.blockchainScripthash_getBalanceBatch(
  //         scripthashes,
  //       );

  //     for (const bal of balances) {
  //       if (bal.error) {
  //         console.warn('electrum_wallet:multiGetBalanceByAddress', bal.error);
  //       }
  //       ret.confirmed += +bal.result.confirmed;
  //       ret.unconfirmed += +bal.result.unconfirmed;
  //       ret.addresses.set(scripthash2addr.get(bal.param)!, bal.result);
  //     }
  //   }
  //   return ret;
  // }

  // async multiGetHistoryByAddress(
  //   addresses: Array<string>,
  //   batchsize: number = 100,
  // ): Promise<Map<string, Array<FullTransactionModel>>> {
  //   this.checkConnection('multiGetHistoryByAddress');

  //   const ret: Map<string, Array<FullTransactionModel>> = new Map();

  //   const chunks = splitIntoChunks(addresses, batchsize);
  //   for (const chunk of chunks) {
  //     const scripthashes = [];
  //     const scripthash2addr: Map<string, string> = new Map();
  //     for (const addr of chunk) {
  //       const script = bitcoin.address.toOutputScript(addr, firo.networkInfo);
  //       const hash = bitcoin.crypto.sha256(script);

  //       const reversedHash = Buffer.from(reverse(hash));
  //       const reversedHashHex = reversedHash.toString('hex');
  //       scripthashes.push(reversedHashHex);
  //       scripthash2addr.set(reversedHashHex, addr);
  //     }

  //     let results = [];

  //     results =
  //       await this.mainClient.blockchainScripthash_getHistoryBatch(
  //         scripthashes,
  //       );

  //     for (const history of results) {
  //       if (history.error) {
  //         console.warn(
  //           'electrum_wallet:multiGetHistoryByAddress',
  //           history.error,
  //         );
  //       }
  //       ret.set(scripthash2addr.get(history.param)!, history.result || []);
  //       for (const result of history.result || []) {
  //         if (result.tx_hash) {
  //           this.txhashHeightCache.set(result.tx_hash, result.height); // cache tx height
  //         }
  //       }

  //       for (const hist of ret.get(scripthash2addr.get(history.param)!) || []) {
  //         hist.address = scripthash2addr.get(history.param) || '';
  //       }
  //     }
  //   }
  //   return ret;
  // }

  async multiGetTransactionByTxid(
    txids: Array<string>,
    batchsize: number = 45,
    verbose?: boolean,
  ): Promise<{ [txId: string]: string }> {
    // this value is fine-tuned so althrough wallets in test suite will occasionally
    // throw 'response too large (over 1,000,000 bytes', test suite will pass
    verbose = verbose !== false;

    const ret: { [txId: string]: string } = {};
    txids = [...new Set(txids)]; // deduplicate just for any case

    const chunks = splitIntoChunks(txids, batchsize);
    for (const chunk of chunks) {
      const res = await Promise.all(
        chunk.map(el =>
          this.mainClient?.blockchain_transaction_get(el, verbose),
        ),
      );
      res.forEach((el: string, index: number) => {
        ret[txids[index]] = el;
      });
    }

    return ret;
  }

  // async getUnspentTransactionsByAddress(
  //   address: string,
  // ): Promise<Array<TransactionModel>> {
  //   this.checkConnection('getUnspentTransactionsByAddress');

  //   const script = bitcoin.address.toOutputScript(address, firo.networkInfo);
  //   const hash = bitcoin.crypto.sha256(script);

  //   const reversedHash = Buffer.from(reverse(hash));
  //   const listUnspent = await this.mainClient.blockchainScripthash_listunspent(
  //     reversedHash.toString('hex'),
  //   );
  //   return listUnspent;
  // }

  async getTxRaw(tx_hash: string, verbose = false) {
    return this.mainClient?.blockchain_transaction_get(tx_hash, verbose);
  }

  async multiGetUnspentTransactions(addresses: Array<string>): Promise<any> {
    const scripthashes = [];
    const scripthash2addr: { [revHash: string]: string } = {};
    for (const address of addresses) {
      const script = bitcoin.address.toOutputScript(address, networkInfo);
      const hash = bitcoin.crypto.sha256(script);

      const reversedHash = Buffer.from(hash.reverse());
      const reversedHashHex = reversedHash.toString('hex');
      scripthashes.push(reversedHashHex);
      scripthash2addr[reversedHashHex] = address;
    }

    const listUnspent = await Promise.all(
      scripthashes.map(
        sh =>
          this.mainClient?.blockchain_scripthash_listunspent(sh) as Promise<
            TransactionModel[]
          >,
      ),
    );

    const filterred = listUnspent.filter(el => el.length > 0).flat();

    const rawTxs = await Promise.all(
      filterred.map(({ tx_hash }) => this.getTxRaw(tx_hash, false)),
    );

    return filterred.map((el, index) => ({
      ...el,
      index: el.tx_pos,
      raw: rawTxs[index],
    }));
  }

  async broadcast(hex: string): Promise<string> {
    const broadcast: string =
      (await this.mainClient?.blockchain_transaction_broadcast(hex)) as string;

    return broadcast;
  }

  async getAnonymitySet(
    setId: number,
    startBlockHash: string,
  ): Promise<AnonymitySetModel> {
    const params = [];
    params.push(setId + '');
    params.push(startBlockHash);
    const result = await this.mainClient?.request(
      'spark.getsparkanonymityset',
      [setId + '', startBlockHash],
    );

    if (result instanceof Error) {
      throw result;
    }

    const _result = result as AnonymitySetModel;

    _result.blockHash = Buffer.from(_result.blockHash, 'base64')
      .reverse()
      .toString('hex');
    _result.setHash = Buffer.from(_result.setHash, 'base64').toString('hex');
    _result.coins = _result.coins.map(coinData => {
      let amount = coinData[2];
      if (typeof amount !== 'number') {
        amount = Buffer.from(amount, 'base64').toString('hex');
      }
      return [
        Buffer.from(coinData[0], 'base64').toString('hex'),
        Buffer.from(coinData[1], 'base64').reverse().toString('hex'),
        Buffer.from(coinData[2], 'base64').reverse().toString('hex'),
      ];
    });
    return _result;
  }

  async getLatestSetId(): Promise<number> {
    const result = await this.mainClient?.request(
      'spark.getsparklatestcoinid',
      [],
    );

    if (result instanceof Error) {
      throw new Error(`${result.message} 23333`);
    }

    return result as number;
  }

  async getUsedCoinSerials(coinCount: number): Promise<UsedSerialsModel> {
    const result = await this.mainClient?.request('spark.getusedcoinstags', [
      String(coinCount),
    ]);

    return result;
  }

  async getSparkAnonymitySetMeta(
    params: string[],
  ): Promise<AnonymitySetMetaModel> {
    const result = await this.mainClient?.request(
      'spark.getsparkanonymitysetmeta',
      params,
    );

    return result;
  }

  async getAllSparkAnonymitySetMeta() {
    if (this.all_anonymity_sets_meta.length) {
      return this.all_anonymity_sets_meta;
    }
    const latestSetId = await this.getLatestSetId();

    const promises = Array.from({ length: latestSetId }, (_, i) =>
      this.getSparkAnonymitySetMeta([String(i + 1)]),
    );
    this.all_anonymity_sets_meta = await Promise.all(promises);

    return this.all_anonymity_sets_meta;
  }

  async getSparkAnonymitySetSector(
    params: string[],
  ): Promise<{ coins: string[][] }> {
    const result = await this.mainClient?.request(
      'spark.getsparkanonymitysetsector',
      params,
    );

    return result;
  }

  addressToScript(address: string): string {
    return bitcoin.address.toOutputScript(address, networkInfo).toString('hex');
  }
}

const splitIntoChunks = function (
  arr: Array<string>,
  chunkSize: number,
): Array<string[]> {
  const groups: Array<string[]> = [];
  let i;
  for (i = 0; i < arr.length; i += chunkSize) {
    groups.push(arr.slice(i, i + chunkSize));
  }
  return groups;
};

export const firoElectrum = new FiroElectrum();
