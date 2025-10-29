import * as ecc from '@bitcoinerlab/secp256k1';
import { Storage } from '@enkryptcom/storage';
import { NetworkNames } from '@enkryptcom/types/dist';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import type { BIP32Interface } from 'bip32';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory, { ECPairInterface } from 'ecpair';
import { PaymentType } from '../../types/bitcoin-network';
import { Utxo } from '../../types/utxo';
import {
  AnonymitySetMetaModel,
  AnonymitySetModel,
} from '../electrum-client/abstract-electrum';
import { firoElectrum } from '../electrum-client/electrum-client';
import { AnonymitySet } from './anonimity-set';
import { BalanceData } from './balance-data';
import configs from './configs';
import type { LelantusCoin } from './lelantus-coin';
import { TransactionItem } from './transaction-item';
import { callRPC } from '@/libs/spark-handler/callRPC';

// Type definitions for Spark mint metadata
export interface SparkMintMetadataRequest {
  coinHashes: Array<{ coinHash: string }>;
}

export interface SparkMintMetadataResponse {
  [height: string]: number; // height -> anonymity set id mapping
}

bitcoin.initEccLib(ecc);

// Initialize ECPair
const ECPair = ECPairFactory(ecc);

export const validator = (
  pubkey: Buffer,
  msghash: Buffer,
  signature: Buffer,
): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);

const EXTERNAL_INDEX = 0;
const INTERNAL_INDEX = 1;
const MINT_INDEX = 2;

const ANONYMITY_SET_EMPTY_ID = 0;

export const SATOSHI = new BigNumber(100000000);

export const TX_DATE_FORMAT = {
  year: '2-digit',
  month: '2-digit',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

export class FiroWallet {
  #storage: Storage;
  secret: string | undefined = undefined;
  seed: string = '';
  network = {
    name: NetworkNames.Firo,
    messagePrefix: '\x18Zcoin Signed Message:\n',
    bech32: 'bc',
    bip32: {
      public: 0x0488b21e,
      private: 0x0488ade4,
    },
    pubKeyHash: 0x52,
    scriptHash: 0x07,
    wif: 0xd2,
    dustThreshold: null,
    paymentType: PaymentType.P2PKH,
    maxFeeRate: 5000 * 2,
  };
  balance: number = 0;
  unconfirmed_balance: number = 0;
  _lelantus_coins_list: LelantusCoin[] = [];
  _lelantus_coins: {
    [txId: string]: LelantusCoin;
  } = {};
  utxo: Array<TransactionItem> = [];
  _lastTxFetch: number = 0;
  _lastBalanceFetch: Date = new Date();
  _balances_by_external_index: Array<BalanceData> = [];
  _balances_by_internal_index: Array<BalanceData> = [];
  _txs_by_external_index: TransactionItem[] = [];
  _txs_by_internal_index: TransactionItem[] = [];
  _address_to_wif_cache: {
    [key: string]: string;
  } = {};

  _anonymity_sets: AnonymitySet[] = [];
  _used_serial_numbers: string[] = [];

  next_free_address_index = 0;
  next_free_change_address_index = 0;
  next_free_mint_index = 0;
  internal_addresses_cache: {
    [index: number]: string;
  } = {};
  external_addresses_cache: {
    [index: number]: string;
  } = {};
  _xPub: string = ''; // cache
  _node0: BIP32Interface | undefined = undefined;
  _node1: BIP32Interface | undefined = undefined;
  usedAddresses = [];
  gap_limit = 20;
  mint_index_gap_limit = 50;

  constructor(storage: Storage) {
    this.#storage = storage;
  }

  async setSecret(secret: string): Promise<void> {
    this.secret = secret;
    this.seed = (await bip39.mnemonicToSeed(this.secret)).toString('hex');
    await this.#storage.set(configs.STORAGE_KEYS.FIRO_WALLET_SECRET, {
      secret,
      seed: this.seed,
    });
  }

  async getSecret(): Promise<Buffer> {
    const { secret } = await this.#storage.get(
      configs.STORAGE_KEYS.FIRO_WALLET_SECRET,
    );
    if (!secret) {
      throw Error('FiroWallet not initialize');
    }
    return bip39.mnemonicToSeedSync(secret);
  }

  async getSpendableUtxos(numAddresses: string[]) {
    const iterationsLimit = Math.floor(numAddresses.length / 2);

    const { secret } = await this.#storage.get(
      configs.STORAGE_KEYS.FIRO_WALLET_SECRET,
    );

    const seed = bip39.mnemonicToSeedSync(secret!);
    const root = bip32.fromSeed(seed, this.network);

    const allUtxos = [];
    const addressKeyPairs: Record<string, any> = {};

    console.log(
      `🔍 Checking up to ${numAddresses.length} derived addresses...`,
    );

    let dd = 0;
    let idx = 0;

    for (let index = 0; index < numAddresses.length; index++) {
      const address = numAddresses[index];

      let dPath = ``;

      if (index >= iterationsLimit) {
        dd = 1;
        dPath = `m/44'/136'/0'/${dd}/${idx}`;
        idx += 1;
      } else {
        dPath = `m/44'/136'/0'/${dd}/${index}`;
      }

      const child = root.derivePath(dPath);
      const keyPair = ECPair.fromPrivateKey(child.privateKey!, {
        network: this.network,
      });
      const { address: derivedAddress } = bitcoin.payments.p2pkh({
        pubkey: child.publicKey,
        network: this.network,
      });

      if (address !== derivedAddress) {
        console.error(
          `🚨 Derived address mismatch! Expected: ${address}, Got: ${derivedAddress}`,
        );
      }

      console.log(`🔹 Checking Address ${index}: ${address}`);
      addressKeyPairs[address!] = keyPair;

      try {
        const { data } = await axios.get<Utxo[]>(
          `https://explorer.firo.org/insight-api-zcoin/addr/${address}/utxo`,
        );
        if (data.length > 0) {
          console.log(`✅ Found ${data.length} UTXOs for ${address}`);
          console.log({ data });

          // Filter for confirmed UTXOs
          const spendableUtxos = data.filter(utxo => utxo.confirmations > 0);

          allUtxos.push(...spendableUtxos.map(utxo => ({ ...utxo, keyPair })));
        }
      } catch (error) {
        console.error(
          `❌ Error fetching UTXOs for ${address}:`,
          (error as { message: string }).message,
        );
      }
    }
    console.log(`🔹 Total Spendable UTXOs: ${allUtxos.length}`);
    return { spendableUtxos: allUtxos, addressKeyPairs };
  }

  getBalance() {
    return new BigNumber(
      this._getUnspentCoins().reduce<number>(
        (previousValue: number, currentValue: LelantusCoin): number => {
          return previousValue + currentValue.value;
        },
        0,
      ),
    ).div(SATOSHI);
  }

  async getOnlySpendableUtxos() {
    const address2Check = await this.getTransactionsAddresses();

    const { data: utxos } = await axios.get<Utxo[]>(
      `https://explorer.firo.org/insight-api-zcoin/addrs/${address2Check.join(',')}/utxo`,
    );
    return utxos.filter(el => el.confirmations > 0);
  }

  async getPublicBalance(): Promise<BigNumber> {
    const address2Check = await this.getTransactionsAddresses();

    const { data: utxos } = await axios.get<Utxo[]>(
      `https://explorer.firo.org/insight-api-zcoin/addrs/${address2Check.join(',')}/utxo`,
    );

    const spendable = utxos.filter(el => el.confirmations > 0);

    let balanceSat = 0;

    spendable.forEach(el => {
      balanceSat += el.satoshis;
    });

    await this.#storage.set(configs.STORAGE_KEYS.FIRO_WALLET_PUBLIC_BALANCE, {
      balanceSat,
    });

    return new BigNumber(balanceSat);
  }

  getUnconfirmedBalance() {
    return new BigNumber(
      this._getUnconfirmedCoins().reduce<number>(
        (previousValue: number, currentValue: LelantusCoin): number => {
          return previousValue + currentValue.value;
        },
        0,
      ),
    ).div(SATOSHI);
  }

  async getXpub(): Promise<string> {
    if (this._xPub !== '') {
      return this._xPub;
    }

    const { seed } = await this.#storage.get(
      configs.STORAGE_KEYS.FIRO_WALLET_SECRET,
    );

    const root = bip32.fromSeed(Buffer.from(seed, 'hex'), this.network);
    this._xPub = root
      .deriveHardened(44)
      .deriveHardened(136)
      .deriveHardened(0)
      .neutered()
      .toBase58();
    return this._xPub;
  }

  addLelantusMintToCache(
    txId: string,
    value: number,
    publicCoin: string,
    index: number,
  ): void {
    this._lelantus_coins_list.push({
      index: index,
      value: value,
      publicCoin: publicCoin,
      txId: txId,
      anonymitySetId: ANONYMITY_SET_EMPTY_ID,
      isUsed: false,
    });
    this.next_free_mint_index = Math.max(index + 1, this.next_free_mint_index);
  }

  markCoinsSpend(spendCoinIndexes: number[]): void {
    this._lelantus_coins_list.forEach(coin => {
      if (spendCoinIndexes.includes(coin.index)) {
        coin.isUsed = true;
      }
    });
  }

  addMintTxToCache(txId: string, value: number, fee: number, address: string) {
    const tx = new TransactionItem();
    tx.address = address;
    tx.value = value;
    tx.txId = txId;
    tx.isMint = true;
    tx.fee = fee;
    this._txs_by_external_index.unshift(tx);
  }

  addSendTxToCache(
    txId: string,
    spendAmount: number,
    fee: number,
    address: string,
  ): void {
    const tx = new TransactionItem();
    tx.address = address;
    tx.value = spendAmount;
    tx.txId = txId;
    tx.fee = fee;
    this._txs_by_external_index.unshift(tx);
  }

  async updateMintMetadata(): Promise<boolean> {
    let hasUpdate = false;
    const unconfirmedCoins = this._getUnconfirmedCoins();
    if (unconfirmedCoins.length > 0) {
      this._anonymity_sets.forEach(set => {
        unconfirmedCoins.forEach(coin => {
          if (
            coin.anonymitySetId < set.setId &&
            set.coins.filter(c => c[0] == coin.publicCoin).length > 0
          ) {
            hasUpdate = true;
            coin.anonymitySetId = set.setId;
            this._updateSendTxStatus(coin);
          }
        });
      });
    }
    return hasUpdate;
  }

  _updateSendTxStatus(coin: LelantusCoin) {
    const tx = this._txs_by_external_index.find(
      item => item.txId === coin.txId,
    );
    if (tx && tx.isMint === false) {
      tx.confirmed = coin.anonymitySetId !== ANONYMITY_SET_EMPTY_ID;
    }
  }

  _getUnconfirmedCoins(): LelantusCoin[] {
    return this._lelantus_coins_list.filter(coin => {
      return !coin.isUsed && coin.anonymitySetId === ANONYMITY_SET_EMPTY_ID;
    });
  }

  _getUnspentCoins(): LelantusCoin[] {
    return this._lelantus_coins_list.filter(coin => {
      return (
        !coin.isUsed &&
        coin.anonymitySetId !== ANONYMITY_SET_EMPTY_ID &&
        coin.value > 0
      );
    });
  }

  async _getWifForAddress(address: string): Promise<string> {
    if (this._address_to_wif_cache[address]) {
      return this._address_to_wif_cache[address]; // cache hit
    }

    // fast approach, first lets iterate over all addressess we have in cache
    for (const index of Object.keys(this.internal_addresses_cache)) {
      const iAddress = await this._getInternalAddressByIndex(+index);
      if (iAddress === address) {
        return (this._address_to_wif_cache[address] =
          await this._getInternalWIFByIndex(+index));
      }
    }

    for (const index of Object.keys(this.external_addresses_cache)) {
      const eAddress = await this._getExternalAddressByIndex(+index);
      if (eAddress === address) {
        return (this._address_to_wif_cache[address] =
          await this._getExternalWIFByIndex(+index));
      }
    }

    // no luck - lets iterate over all addresses we have up to first unused address index
    for (
      let c = 0;
      c <= this.next_free_change_address_index + this.gap_limit;
      c++
    ) {
      const possibleAddress = await this._getInternalAddressByIndex(c);
      if (possibleAddress === address) {
        return (this._address_to_wif_cache[address] =
          await this._getInternalWIFByIndex(c));
      }
    }

    for (let c = 0; c <= this.next_free_address_index + this.gap_limit; c++) {
      const possibleAddress = await this._getExternalAddressByIndex(c);
      if (possibleAddress === address) {
        return (this._address_to_wif_cache[address] =
          await this._getExternalWIFByIndex(c));
      }
    }

    throw new Error('Could not find WIF for ' + address);
  }

  async _getKeyPairFromWIF(wif: string): Promise<ECPairInterface> {
    return ECPair.fromWIF(wif, this.network);
  }

  async _getExternalWIFByIndex(index: number): Promise<string> {
    return this._getWIFByIndex(EXTERNAL_INDEX, index);
  }

  async _getInternalWIFByIndex(index: number): Promise<string> {
    return this._getWIFByIndex(INTERNAL_INDEX, index);
  }

  async _getMintWIFByIndex(index: number): Promise<string> {
    return this._getWIFByIndex(MINT_INDEX, index);
  }

  async _getWIFByIndex(node: number, index: number): Promise<string> {
    const child = this._getNode(node, index);
    return child.toWIF();
  }

  _getNode(node: number, index: number): BIP32Interface {
    if (!this.secret) {
      throw Error('illegal state secret is null');
    }

    const root = bip32.fromSeed(Buffer.from(this.seed, 'hex'), this.network);
    const path = `m/44'/136'/0'/${node}/${index}`;
    const child = root.derivePath(path);

    return child;
  }

  skipAddress(): void {
    this.next_free_address_index += 1;
  }

  async getAddressAsync(): Promise<string> {
    // looking for free external address
    let freeAddress = '';
    let c;
    for (c = 0; true; c++) {
      if (this.next_free_address_index + c < 0) {
        continue;
      }
      const address = await this._getExternalAddressByIndex(
        this.next_free_address_index + c,
      );
      if (!address) {
        continue;
      }
      this.external_addresses_cache[this.next_free_address_index + c] = address; // updating cache just for any case
      let txs = [];
      try {
        txs = [];
        // txs = await firoElectrum.getTransactionsByAddress(address);
      } catch (e) {
        console.error('firo_wallet:getAddressAsync', e);
      }
      if (txs.length === 0) {
        // found free address
        freeAddress = address;
        this.next_free_address_index += c; // now points to _this one_
        break;
      }
    }

    return freeAddress;
  }

  async getChangeAddressAsync(): Promise<string> {
    // looking for free internal address
    let freeAddress = '';
    let c;
    for (c = 0; true; c++) {
      if (this.next_free_change_address_index + c < 0) {
        continue;
      }
      const address = await this._getInternalAddressByIndex(
        this.next_free_change_address_index + c,
      );
      if (address) {
        this.internal_addresses_cache[this.next_free_change_address_index + c] =
          address; // updating cache just for any case
        let txs = [];
        try {
          txs = [];
          // txs = await firoElectrum.getTransactionsByAddress(address);
        } catch (e) {
          console.error('firo_wallet:getChangeAddressAsync', e);
        }
        if (txs.length === 0) {
          // found free address
          freeAddress = address;
          this.next_free_change_address_index += c; // now points to _this one_
          break;
        }
      }
    }

    return freeAddress;
  }

  async _getInternalAddressByIndex(index: number): Promise<string | undefined> {
    return this._getNodeAddressByIndex(INTERNAL_INDEX, index);
  }

  async _getExternalAddressByIndex(index: number): Promise<string | undefined> {
    return this._getNodeAddressByIndex(EXTERNAL_INDEX, index);
  }

  async _getNodeAddressByIndex(node: number, index: number) {
    index = index * 1; // cast to int
    if (node === EXTERNAL_INDEX) {
      if (this.external_addresses_cache[index]) {
        return this.external_addresses_cache[index]; // cache hit
      }
    }

    if (node === INTERNAL_INDEX) {
      if (this.internal_addresses_cache[index]) {
        return this.internal_addresses_cache[index]; // cache hit
      }
    }

    if (node === EXTERNAL_INDEX && !this._node0) {
      const xpub = await this.getXpub();
      const hdNode = bip32.fromBase58(xpub, this.network);
      this._node0 = hdNode.derive(node);
    }

    if (node === INTERNAL_INDEX && !this._node1) {
      const xpub = await this.getXpub();
      const hdNode = bip32.fromBase58(xpub, this.network);
      this._node1 = hdNode.derive(node);
    }

    let address;
    if (node === EXTERNAL_INDEX) {
      address = this._nodeToLegacyAddress(this._node0!.derive(index));
    }

    if (node === INTERNAL_INDEX) {
      address = this._nodeToLegacyAddress(this._node1!.derive(index));
    }

    if (node === EXTERNAL_INDEX) {
      return (this.external_addresses_cache[index] = address!);
    }

    if (node === INTERNAL_INDEX) {
      return (this.internal_addresses_cache[index] = address!);
    }
  }

  _nodeToLegacyAddress(hdNode: BIP32Interface) {
    return bitcoin.payments.p2pkh({
      pubkey: hdNode.publicKey,
      network: this.network,
    }).address;
  }

  async getTransactionsAddresses(): Promise<string[]> {
    await this.getXpub();
    const address2Fetch: string[] = [];
    // external addresses first
    for (let c = 0; c < this.next_free_address_index + 40; c++) {
      const extAddr = (await this._getExternalAddressByIndex(c)) as string;
      address2Fetch.push(extAddr);
    }

    for (let c = 0; c < this.next_free_change_address_index + 40; c++) {
      const intAddr = await this._getInternalAddressByIndex(c);
      address2Fetch.push(intAddr!);
    }

    return address2Fetch;
  }

  validate(address: string): boolean {
    try {
      bitcoin.address.toOutputScript(address, this.network);
      return true;
    } catch (e) {
      return false;
    }
  }

  // async fetchTransactions() {
  //   let hasChanges = false;
  //   const address2Check = await this.getTransactionsAddresses();
  //   try {
  //     // const fullTxs =
  //     //   await firoElectrum.multiGetTransactionsFullByAddress(address2Check);
  //     const fullTxs = [];
  //     fullTxs.forEach(tx => {
  //       const foundTxs = this._txs_by_external_index.filter(
  //         item => item.txId === tx.txid,
  //       );

  //       if (
  //         foundTxs.length == 0 ||
  //         (foundTxs.length == 1 &&
  //           foundTxs[0].received == false &&
  //           foundTxs[0].isMint == false)
  //       ) {
  //         const transactionItem = new TransactionItem();
  //         transactionItem.address = tx.address;
  //         transactionItem.txId = tx.txid;
  //         if (tx.confirmations > 0) {
  //           transactionItem.confirmed = tx.confirmations > 0;
  //           transactionItem.date = tx.time * 1000;
  //         }

  //         const ia = tx.inputs.reduce(
  //           (acc, elm) => acc.plus(elm.value),
  //           new BigNumber(0),
  //         );
  //         const oa = tx.outputs.reduce(
  //           (acc, elm) => acc.plus(elm.value),
  //           new BigNumber(0),
  //         );

  //         transactionItem.fee = ia.minus(oa).toNumber();

  //         if (
  //           tx.outputs.length === 1 &&
  //           tx.outputs[0].scriptPubKey &&
  //           tx.outputs[0].scriptPubKey.type === 'lelantusmint'
  //         ) {
  //           transactionItem.received = false;
  //           transactionItem.isMint = true;
  //           transactionItem.value = tx.outputs[0].value;
  //         } else {
  //           let sumValue: BigNumber = new BigNumber(0);
  //           tx.outputs.forEach(vout => {
  //             if (vout.addresses && vout.addresses.includes(tx.address)) {
  //               sumValue = sumValue.plus(vout.value);
  //               transactionItem.received = true;
  //             }
  //           });
  //           transactionItem.value = sumValue.toNumber();
  //         }

  //         if (transactionItem.received || transactionItem.isMint) {
  //           hasChanges = true;
  //           this._txs_by_external_index.push(transactionItem);
  //         }
  //       }
  //       foundTxs.forEach(foundTx => {
  //         if (foundTx.confirmed === false && tx.confirmations > 0) {
  //           hasChanges = true;
  //           foundTx.confirmed = true;
  //           foundTx.date = tx.time * 1000;
  //         }
  //       });
  //     });
  //   } catch (e) {
  //     console.error('firo_wallet:fetchTransaction', e);
  //   }
  //   if (hasChanges) {
  //     this.sortTransactions();
  //   }
  //   return hasChanges;
  // }

  private sortTransactions() {
    this._txs_by_external_index.sort(
      (tx1: TransactionItem, tx2: TransactionItem) => {
        if (Math.abs(tx2.date - tx1.date) < 1000) {
          if (
            (tx2.isMint && tx1.received) ||
            (tx2.received && !tx1.received && !tx1.isMint)
          ) {
            return 1;
          } else if (
            (tx1.isMint && tx2.received) ||
            (tx1.received && !tx2.received && !tx2.isMint)
          ) {
            return -1;
          } else {
            return tx2.date - tx1.date;
          }
        } else {
          return tx2.date - tx1.date;
        }
      },
    );
  }

  getTransactions(): TransactionItem[] {
    return this._txs_by_external_index;
  }

  getTransactionsByAddress(address: string): TransactionItem[] {
    return this._txs_by_external_index.filter(tx => {
      return tx.address === address;
    });
  }

  async fetchAnonymitySets(): Promise<boolean> {
    let hasChanges = false;
    const latestSetId = await firoElectrum.getLatestSetId();
    for (let setId = 1; setId <= latestSetId; setId++) {
      let anonymitySet = this._anonymity_sets.find(set => set.setId === setId);
      if (!anonymitySet) {
        anonymitySet = new AnonymitySet();
        anonymitySet.setId = setId;
        this._anonymity_sets.push(anonymitySet);
      }
      const fetchedAnonymitySet = await firoElectrum.getAnonymitySet(
        anonymitySet.setId,
        anonymitySet.blockHash,
      );

      if (
        fetchedAnonymitySet.setHash !== '' &&
        anonymitySet.setHash !== fetchedAnonymitySet.setHash
      ) {
        anonymitySet.setHash = fetchedAnonymitySet.setHash;
        anonymitySet.blockHash = fetchedAnonymitySet.blockHash;
        fetchedAnonymitySet.coins.reverse().forEach(coin => {
          anonymitySet?.coins.unshift(coin);
        });
        hasChanges = true;
      }
    }
    return hasChanges;
  }

  async getSetsMeta() {
    return this.getAllSparkAnonymitySetMeta();
  }
  async fetchAllAnonymitySets() {
    const setsMeta = await this.getSetsMeta();

    const setsPromises = setsMeta.map(async (metaItem, i) => {
      console.log(`starting to fetch setId: ${i + 1}`);
      const [firstChunk, secondChunk] = await Promise.all([
        this.fetchAnonymitySetSector(
          i + 1,
          metaItem.blockHash,
          0,
          Math.floor(metaItem.size / 2),
        ),
        this.fetchAnonymitySetSector(
          i + 1,
          metaItem.blockHash,
          Math.floor(metaItem.size / 2),
          metaItem.size,
        ),
      ]);

      return {
        blockHash: metaItem.blockHash,
        setHash: metaItem.setHash,
        coins: [...firstChunk.coins, ...secondChunk.coins],
      };
    });

    return (await Promise.all(setsPromises)) as AnonymitySetModel[];
  }

  async getUsedSparkCoinsTags(startPoint: number): Promise<string> {
    return await firoElectrum.getUsedCoinsTags(startPoint);
  }

  async getUsedCoinsTagsTxHashes(): Promise<string> {
    return await firoElectrum.getUsedCoinsTagsTxHashes();
  }

  async fetchAnonymitySetSector(
    setId: number,
    latestBlockHash: string,
    startIndex: number,
    endIndex: number,
  ): Promise<{ coins: string[][] }> {
    return firoElectrum.getSparkAnonymitySetSector([
      String(setId),
      latestBlockHash,
      String(startIndex),
      String(endIndex),
    ]);
  }

  async getAllSparkAnonymitySetMeta(): Promise<AnonymitySetMetaModel[]> {
    return firoElectrum.getAllSparkAnonymitySetMeta();
  }

  /**
   * Get spark mint metadata for given coin hashes
   * @param coinHashes Array of coin hash strings
   * @returns Array of metadata objects containing height and anonymity set id for each coin
   */
  async getSparkMintMetadata(
    coinHashes: string[],
  ): Promise<SparkMintMetadataResponse[]> {
    try {
      const params: SparkMintMetadataRequest = {
        coinHashes: coinHashes.map(hash => ({ coinHash: hash })),
      };

      const result = await firoElectrum.getCoinIDs(coinHashes);

      return result;
    } catch (error) {
      console.error('Error fetching spark mint metadata:', error);
      throw new Error(
        `Failed to get spark mint metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get spark mint metadata for a single coin hash
   * @param coinHash Single coin hash string
   * @returns Metadata object containing height and anonymity set id for the coin, or null if not found
   */
  async getSparkMintMetadataSingle(
    coinHash: string,
  ): Promise<SparkMintMetadataResponse | null> {
    try {
      const results = await this.getSparkMintMetadata([coinHash]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error fetching single spark mint metadata:', error);
      throw error;
    }
  }

  private async fixDuplicateCoinIssue(): Promise<boolean> {
    let hasChanges = false;
    let unspentCoins = this._getUnspentCoins();
    unspentCoins.forEach(coin => {
      const duplicateCoins = this._lelantus_coins_list.filter(
        c => c.index == coin.index,
      );
      if (duplicateCoins.length > 1) {
        const maxSetId = Math.max(...duplicateCoins.map(c => c.anonymitySetId));
        this._lelantus_coins_list = this._lelantus_coins_list.filter(
          c => c.index != coin.index || c.anonymitySetId == maxSetId,
        );
        hasChanges = true;
      }
    });
    unspentCoins = this._getUnspentCoins();
    unspentCoins.forEach(coin => {
      this._anonymity_sets.forEach(set => {
        if (coin.anonymitySetId < set.setId) {
          const foundCoin = set.coins.find(
            setCoin => setCoin[0] === coin.publicCoin,
          );
          if (foundCoin) {
            coin.anonymitySetId = set.setId;
            hasChanges = true;
          }
        }
      });
    });
    return hasChanges;
  }

  async fetchUsedCoins(): Promise<boolean> {
    let hasChanges = false;
    const usedSerialNumbers = (
      await firoElectrum.getUsedCoinSerials(this._used_serial_numbers.length)
    ).serials;
    hasChanges = usedSerialNumbers.length > 0;
    this._used_serial_numbers = [
      ...this._used_serial_numbers,
      ...usedSerialNumbers,
    ];
    return hasChanges;
  }

  async sync(callback: () => void): Promise<void> {
    // if (await this.fetchTransactions()) {
    //   callback();
    // }

    if (await this.fetchUsedCoins()) {
      callback();
    }

    if (await this.fetchAllAnonymitySets()) {
      callback();
    }

    if (await this.fixDuplicateCoinIssue()) {
      callback();
    }
  }

  async restore(
    callback: (progress: number, total: number) => void,
  ): Promise<void> {
    let callbackIndex = 1;
    const totalCallbacks = 5;

    callback(callbackIndex++, totalCallbacks);
    await this.getAddressAsync();
    await this.getChangeAddressAsync();
    // await this.fetchTransactions();

    callback(callbackIndex++, totalCallbacks);
    await this.fetchUsedCoins();

    callback(callbackIndex++, totalCallbacks);
    await this.fetchAllAnonymitySets();
  }

  // private async fetchSpendTxs(spendTxIds: string[]): Promise<void> {
  //   const spendTxs = await firoElectrum.multiGetTransactionByTxid(spendTxIds);
  //   for (const [txid, tx] of Object.entries(spendTxs)) {
  //     const foundTxs = this._txs_by_external_index.filter(
  //       item => item.txId === tx.txid,
  //     );

  //     if (foundTxs.length == 0 || foundTxs.length == 1 && foundTxs[0].received == true) {
  //       const transactionItem = new TransactionItem();
  //       if (tx.confirmations > 0) {
  //         transactionItem.confirmed = tx.confirmations > 0;
  //         transactionItem.date = tx.time * 1000;
  //       }
  //       tx.vout.forEach(vout => {
  //         if (vout.value > 0) {
  //           transactionItem.value += vout.value;
  //           transactionItem.address = vout.scriptPubKey.addresses[0];
  //         }
  //       });
  //       transactionItem.txId = txid;
  //       tx.vin.forEach(vin => (transactionItem.fee += vin.nFees));
  //       this._txs_by_external_index.unshift(transactionItem);
  //     }
  //   }

  //   this.sortTransactions();
  // }

  prepareForSerialization(): void {
    this._txs_by_external_index = [];
    this._txs_by_internal_index = [];

    this._anonymity_sets = [];

    this._used_serial_numbers = [];

    // this.internal_addresses_cache = {};
    // this.external_addresses_cache = {};

    delete this._node0;
    delete this._node1;
  }

  // static fromJson(obj: string): FiroWallet {
  //   const obj2 = JSON.parse(obj);
  //   const temp: {
  //     [key: string]: any;
  //   } = new this();
  //   for (const key2 of Object.keys(obj2)) {
  //     temp[key2] = obj2[key2];
  //   }

  //   return temp as FiroWallet;
  // }
}
