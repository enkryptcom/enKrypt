import {
  type AbstractElectrum,
  BalanceModel,
  TransactionModel,
  FullTransactionModel,
  type AnonymitySetModel,
  type UsedSerialsModel,
} from './abstract-electrum';
// @ts-ignore
import ElectrumClient from 'electrum-client';
// @ts-ignore
import reverse from 'buffer-reverse';

import bitcoin from "bitcoinjs-lib"
import firo from '../../networks/firo';

type Peer = {
  host: string;
  tcp: string | null;
  ssl: string | null;
};

const hardcodedPeers: Peer[] = [
  {host: 'electrumx.firo.org', tcp: '50001', ssl: "50002"},
  {host: 'electrumx01.firo.org', tcp: '50001', ssl: "50002"},
  {host: 'electrumx02.firo.org', tcp: '50001', ssl: "50002"},
  {host: 'electrumx03.firo.org', tcp: '50001', ssl: "50002"},
];

/**
 * Returns random hardcoded electrum server guaranteed to work
 * at the time of writing.
 *
 * @returns {Promise<{tcp, host}|*>}
 */
async function getRandomHardcodedPeer(): Promise<Peer> {
  const index = Math.ceil(hardcodedPeers.length * Math.random()) - 1;
  return hardcodedPeers[index];
}

async function getSavedPeer(): Promise<Peer | null> {
    return {host: "electrumx.firo.org", tcp: "50001", ssl: "50002"};
}

export default class FiroElectrum implements AbstractElectrum {
  multiGetTransactionsFullByAddress(addresses: Array<string>, batchSize?: number, verbose?: boolean): Promise<Array<FullTransactionModel>> {
    throw new Error('Method not implemented.');
  }
  mainClient: ElectrumClient = undefined;
  mainConnected = false;
  wasConnectedAtLeastOnce = false;
  serverName = false;

  latestBlockheight: number | false = false;
  latestBlockheightTimestamp: number = 0;

  txhashHeightCache: Map<string, number> = new Map();

  listeners: Array<() => void> = [];

  getLatestBlockHeight(): number {
    return this.latestBlockheight === false ? -1 : this.latestBlockheight;
  }

  async connectMain() {
    let peer = await getSavedPeer();
    if (peer === null) {
      peer = await getRandomHardcodedPeer();
    }

    try {
      this.mainClient = new ElectrumClient(
        peer.ssl || peer.tcp,
        peer.host,
        peer.ssl ? 'tls' : 'tcp',
      );
      this.mainClient.onError = function () {
        this.mainConnected = false;
      };
      const ver = await this.mainClient.connect({
        client: 'firo',
        version: '1.4',
      });
      if (ver && ver[0]) {
        this.serverName = ver[0];
        this.mainConnected = true;
        this.wasConnectedAtLeastOnce = true;
      }
    } catch (e) {
      this.mainConnected = false;
      console.error(
        'electrum_wallet:connectMain',
        JSON.stringify(peer) + ' ' + e,
      );
    }

    this.runSubscribeLoop();

    if (!this.mainConnected) {
      console.warn('electrum_wallet:connectMain', 'retry');
      // this.mainClient.close && this.mainClient.close();
      setTimeout(() => {
        this.connectMain();
      }, 5000);
    }
  }

  private subscribeLoop = 0;
  private runSubscribeLoop() {
    console.log('electrum_wallet:runSubscribeLoop', 'start loop');
    clearInterval(this.subscribeLoop);
    this.subscribeLoop = setInterval(() => {
      this.checkForSubscribe();
    }, 5000) as unknown as number;
  }

  private checkForSubscribe() {
    if (this.mainClient !== undefined && this.mainClient.status === 1) {
      if (
        this.mainClient.subscribe._events['blockchain.headers.subscribe'] ===
        undefined
      ) {
        this.subscribeHeaders();
      }
    }
  }

  private async subscribeHeaders() {
    this.mainClient.subscribe.on(
      'blockchain.headers.subscribe',
      (params: any) => {
        this.onHeaderChange(params[0]);
      },
    );
    const header = await this.mainClient.blockchainHeaders_subscribe();
    if (header && header.height) {
      this.onHeaderChange(header);
    }
  }

  private onHeaderChange(headerData: {height: number}) {
    if (this.latestBlockheight !== headerData.height) {
      this.latestBlockheight = headerData.height;
      this.latestBlockheightTimestamp = Math.floor(+new Date() / 1000);

      this.notifyListeners();
    }
  }

  private notifyListeners() {
    console.log(
      'electrum_wallet:notifyListeners',
      `listeners count ${this.listeners.length}`,
    );
    this.listeners.forEach(listener => {
      listener();
    });
  }

  addChangeListener(onChange: () => void): void {
    this.listeners.push(onChange);
  }

  removeChangeListener(onChange: () => void): void {
    this.listeners = this.listeners.filter(listener => {
      return listener !== onChange;
    });
  }

  async getBalanceByAddress(address: string): Promise<BalanceModel> {
    this.checkConnection('getBalanceByAddress');
    const script = bitcoin.address.toOutputScript(address, firo.networkInfo);
    const hash = bitcoin.crypto.sha256(script);
     
    const reversedHash = Buffer.from(reverse(hash));
    const balance = await this.mainClient.blockchainScripthash_getBalance(
      reversedHash.toString('hex'),
    );
    return balance;
  }

  async getTransactionsByAddress(
    address: string,
  ): Promise<Array<TransactionModel>> {
    this.checkConnection('getTransactionsByAddress');
    const script = this.addressToScript(address);
    const hash = bitcoin.crypto.sha256(Buffer.from(script));
     
    const reversedHash = Buffer.from(reverse(hash));
    const history = await this.mainClient.blockchainScripthash_getHistory(
      reversedHash.toString('hex'),
    );
    // for (const h of history || []) {
    //   if (h.tx_hash) txhashHeightCache[h.tx_hash] = h.height; // cache tx height
    // }
    return history;
  }

  async multiGetTransactionsByAddress(
    addresses: Array<string>,
    batchsize: number = 200,
  ): Promise<{[address: string]: TransactionModel[]}> {
    this.checkConnection('multiGetTransactionsByAddress');

    const ret: {[address: string]: TransactionModel[]} = {};

    const chunks = splitIntoChunks(addresses, batchsize);
    for (const chunk of chunks) {
      const scripthashes = [];
      const scripthash2addr: {[revHash: string]: string} = {};
      for (const addr of chunk) {
        const script = bitcoin.address.toOutputScript(addr, firo.networkInfo);
        const hash = bitcoin.crypto.sha256(script);
         
        const reversedHash = Buffer.from(reverse(hash));
        const reversedHashHex = reversedHash.toString('hex');
        scripthashes.push(reversedHashHex);
        scripthash2addr[reversedHashHex] = addr;
      }

      const results = []

      for (const sh of scripthashes) {
        const res = await this.mainClient.blockchainScripthash_getHistory(
          sh
        )
        
        results.push(res)
      }
      
      for (const history of results) {
        if (history.error) {
          console.warn(
            'electrum_wallet:multiGetTransactionsByAddress',
            history.error,
          );
        }
        if (history?.result?.length > 0) {
          ret[scripthash2addr[history.param]] = history.result;
        }
      }
    }

    return ret;
  }

  async getTransactionsFullByAddress(
    address: string,
  ): Promise<Array<FullTransactionModel>> {
    this.checkConnection('getTransactionsFullByAddress');

    const txs = await this.getTransactionsByAddress(address);
    const ret = [];
    for (const tx of txs) {
      const full = await this.mainClient.blockchainTransaction_get(
        tx.tx_hash,
        true,
      );
      full.address = address;
      for (const input of full.vin) {
        // now we need to fetch previous TX where this VIN became an output, so we can see its amount
        const prevTxForVin = await this.mainClient.blockchainTransaction_get(
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

  async multiGetBalanceByAddress(
    addresses: Array<string>,
    batchsize: number = 200,
  ): Promise<BalanceModel> {
    this.checkConnection('multiGetBalanceByAddress');

    const ret = new BalanceModel();

    const chunks = splitIntoChunks(addresses, batchsize);
    for (const chunk of chunks) {
      const scripthashes = [];
      const scripthash2addr: Map<string, string> = new Map();
      for (const addr of chunk) {
        const script = bitcoin.address.toOutputScript(addr, firo.networkInfo);
        const hash = bitcoin.crypto.sha256(script);
         
        const reversedHash = Buffer.from(reverse(hash));
        const reversedHashHex = reversedHash.toString('hex');
        scripthashes.push(reversedHashHex);
        scripthash2addr.set(reversedHashHex, addr);
      }

      let balances = [];

      balances = await this.mainClient.blockchainScripthash_getBalanceBatch(
        scripthashes,
      );

      for (const bal of balances) {
        if (bal.error) {
          console.warn('electrum_wallet:multiGetBalanceByAddress', bal.error);
        }
        ret.confirmed += +bal.result.confirmed;
        ret.unconfirmed += +bal.result.unconfirmed;
        ret.addresses.set(scripthash2addr.get(bal.param)!, bal.result);
      }
    }
    return ret;
  }

  async multiGetHistoryByAddress(
    addresses: Array<string>,
    batchsize: number = 100,
  ): Promise<Map<string, Array<FullTransactionModel>>> {
    this.checkConnection('multiGetHistoryByAddress');

    const ret: Map<string, Array<FullTransactionModel>> = new Map();

    const chunks = splitIntoChunks(addresses, batchsize);
    for (const chunk of chunks) {
      const scripthashes = [];
      const scripthash2addr: Map<string, string> = new Map();
      for (const addr of chunk) {
        const script = bitcoin.address.toOutputScript(addr, firo.networkInfo);
        const hash = bitcoin.crypto.sha256(script);
         
        const reversedHash = Buffer.from(reverse(hash));
        const reversedHashHex = reversedHash.toString('hex');
        scripthashes.push(reversedHashHex);
        scripthash2addr.set(reversedHashHex, addr);
      }

      let results = [];

      results = await this.mainClient.blockchainScripthash_getHistoryBatch(
        scripthashes,
      );

      for (const history of results) {
        if (history.error) {
          console.warn(
            'electrum_wallet:multiGetHistoryByAddress',
            history.error,
          );
        }
        ret.set(scripthash2addr.get(history.param)!, history.result || []);
        for (const result of history.result || []) {
          if (result.tx_hash) {
            this.txhashHeightCache.set(result.tx_hash, result.height); // cache tx height
          }
        }

        for (const hist of ret.get(scripthash2addr.get(history.param)!) || []) {
          hist.address = scripthash2addr.get(history.param) || '';
        }
      }
    }
    return ret;
  }

  async multiGetTransactionByTxid(
    txids: Array<string>,
    batchsize: number = 45,
    verbose?: boolean,
  ): Promise<{[txId: string]: string}> {
    this.checkConnection('multiGetTransactionByTxid');

    // this value is fine-tuned so althrough wallets in test suite will occasionally
    // throw 'response too large (over 1,000,000 bytes', test suite will pass
    verbose = verbose !== false;

    const ret: {[txId: string]: string} = {};
    txids = [...new Set(txids)]; // deduplicate just for any case

    const chunks = splitIntoChunks(txids, batchsize);
    for (const chunk of chunks) {
      const res = await Promise.all(chunk.map(el => this.mainClient.blockchainTransaction_get(
        el,
        verbose,
      )))
      res.forEach((el: string, index: number) => {
        ret[txids[index]] = el
      })
    }

    return ret;
  }

  async getUnspentTransactionsByAddress(
    address: string,
  ): Promise<Array<TransactionModel>> {
    this.checkConnection('getUnspentTransactionsByAddress');

    const script = bitcoin.address.toOutputScript(address, firo.networkInfo);
    const hash = bitcoin.crypto.sha256(script);
     
    const reversedHash = Buffer.from(reverse(hash));
    const listUnspent = await this.mainClient.blockchainScripthash_listunspent(
      reversedHash.toString('hex'),
    );
    return listUnspent;
  }

  async multiGetUnspentTransactionsByAddress(
    addresses: Array<string>,
  ): Promise<{[address: string]: TransactionModel[]}> {
    this.checkConnection('multiGetUnspentTransactionsByAddress');

    const scripthashes = [];
    const scripthash2addr: {[revHash: string]: string} = {};
    for (const address of addresses) {
      const script = bitcoin.address.toOutputScript(address, firo.networkInfo);
      const hash = bitcoin.crypto.sha256(script);
       
      const reversedHash = Buffer.from(reverse(hash));
      const reversedHashHex = reversedHash.toString('hex');
      scripthashes.push(reversedHashHex);
      scripthash2addr[reversedHashHex] = address;
    }
    const ret: {[address: string]: TransactionModel[]} = {};

    const listUnspent = await Promise.all(scripthashes.map(sh => this.mainClient.blockchainScripthash_listunspent(
      sh,
    )))

    for (const utxo of listUnspent) {
      if (utxo.result.length > 0) {
        ret[scripthash2addr[utxo.param]!] = utxo.result;
      }
    }
    return ret;
  }

  async broadcast(hex: string): Promise<string> {
    this.checkConnection('broadcast');

    const broadcast: string = await this.mainClient.blockchainTransaction_broadcast(
      hex,
    );

    return broadcast;
  }

  async getAnonymitySet(
    setId: number,
    startBlockHash: string,
  ): Promise<AnonymitySetModel> {
    this.checkConnection('getAnonymitySet');

    const param = [];
    param.push(setId + '');
    param.push(startBlockHash);
    const result: AnonymitySetModel = await this.mainClient.request(
      'lelantus.getanonymityset',
      param,
    );
    result.blockHash = Buffer.from(result.blockHash, "base64").reverse().toString('hex')
    result.setHash = Buffer.from(result.setHash, "base64").toString('hex')
    result.coins = result.coins.map(coinData => {
      let amount = coinData[2];
      if (typeof amount !== 'number') {
        amount = Buffer.from(amount, "base64").toString('hex');
      }
      return [
        Buffer.from(coinData[0], "base64").toString('hex'),
        Buffer.from(coinData[1], "base64").reverse().toString('hex'),
        amount,
        Buffer.from(coinData[3], "base64").reverse().toString('hex')
      ]
    });
    return result;
  }

  async getLatestSetId(): Promise<number> {
    this.checkConnection('getLatestSetId');

    const result = await this.mainClient.request('lelantus.getlatestcoinid');
    return result;
  }

  async getUsedCoinSerials(coinCount: number): Promise<UsedSerialsModel> {
    this.checkConnection('getUsedCoinSerials');

    const param = [];
    param.push(coinCount + '');
    const result: UsedSerialsModel = await this.mainClient.request(
      'lelantus.getusedcoinserials',
      param,
    );
    result.serials = result.serials.map(serialBase64 => Buffer.from(serialBase64, "base64").toString('hex'));

    return result;
  }
  
  async getsparkanonymitysetmeta(params: string[]): Promise<number> {
    this.checkConnection('getsparkanonymitysetmeta');
    
    // const param = [];
    // param.push(coinCount + '');
    const result: number = await this.mainClient.request(
      'spark.getsparkanonymitysetmeta',
      params,
    );
    // result.serials = result.serials.map(serialBase64 => Buffer.from(serialBase64, "base64").toString('hex'));

    return result;
  }
  
  async getsparkanonymitysetsector(params: string[]): Promise<number> {
    this.checkConnection('getsparkanonymitysetsector');
    
    // const param = [];
    // param.push(coinCount + '');
    const result: number = await this.mainClient.request(
      'spark.getsparkanonymitysetsector',
      params,
    );
    // result.serials = result.serials.map(serialBase64 => Buffer.from(serialBase64, "base64").toString('hex'));

    return result;
  }

  async getFeeRate(): Promise<number> {
    this.checkConnection('getFeeRate');

    const params = [];
    params.push(10);
    const result = await this.mainClient.request(
      'blockchain.estimatefee',
      params,
    );

    return result;
  }

  addressToScript(address: string): string {
    return bitcoin.address.toOutputScript(address, firo.networkInfo).toString("hex");
  }

  private checkConnection(tag: string) {
    if (typeof this.mainClient === 'undefined' || this.mainClient === null) {
      console.error(`electrum_wallet:${tag}`, 'not connected');
      throw new Error('Electrum client is not connected');
    }
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

export const firoElectrum: AbstractElectrum = new FiroElectrum();
