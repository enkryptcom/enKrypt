import * as ecc from '@bitcoinerlab/secp256k1';
import { Storage } from '@enkryptcom/storage';
import { NetworkNames } from '@enkryptcom/types/dist';
import BigNumber from 'bignumber.js';
import type { BIP32Interface } from 'bip32';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory, { ECPairInterface } from 'ecpair';
import { PaymentType } from '../../types/bitcoin-network';
import {
  AnonymitySetMetaModel,
  AnonymitySetModel,
  UnspentTxOutputModel,
} from '../electrum-client/abstract-electrum';
import { firoElectrum } from '../electrum-client/electrum-client';
import configs from './configs';
import { getSparkState } from '@/libs/spark-handler/generateSparkWallet';
import {
  LOCAL_STORAGE_KEYS,
  LOCAL_STORAGE_PREFIXES,
  LocalStorageHelper,
} from '@action/db/localStorage';
import BrowserStorage from '@/libs/common/browser-storage';
import { InternalStorageNamespace } from '@/types/provider';

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

export const SATOSHI = new BigNumber(100000000);

const NETWORK = {
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

export class BaseFiroWallet {
  #storage: Storage;
  secret: string | undefined = undefined;
  seed: string = '';
  network = NETWORK;
  balance: number = 0;

  next_free_address_index = 0;
  next_free_change_address_index = 0;
  internal_addresses_cache: {
    [index: number]: string;
  } = {};
  external_addresses_cache: {
    [index: number]: string;
  } = {};
  _xPub: string = ''; // cache
  _node0: BIP32Interface | undefined = undefined;
  _node1: BIP32Interface | undefined = undefined;

  constructor() {
    this.#storage = new BrowserStorage(InternalStorageNamespace.firoWallet);
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
    const value = await this.#storage.get(
      configs.STORAGE_KEYS.FIRO_WALLET_SECRET,
    );
    if (!value || !value?.secret) {
      throw Error('FiroWallet not initialize');
    }
    const { secret } = value;
    return bip39.mnemonicToSeedSync(secret);
  }

  async getAddressKeyPairMapping(
    addresses: string[],
  ): Promise<Record<string, ECPairInterface>> {
    const iterationsLimit = Math.floor(addresses.length / 2);
    const addressKeyPairs: Record<string, ECPairInterface> = {};

    const { secret } = await this.#storage.get(
      configs.STORAGE_KEYS.FIRO_WALLET_SECRET,
    );

    const seed = bip39.mnemonicToSeedSync(secret!);
    const root = bip32.fromSeed(seed, this.network);

    let dd = 0;
    let idx = 0;

    for (let index = 0; index < addresses.length; index++) {
      const address = addresses[index];

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

      addressKeyPairs[address!] = keyPair;
    }
    return addressKeyPairs;
  }

  async getSpendableUtxos(numAddresses: string[]) {
    const addressKeyPairMapping =
      await this.getAddressKeyPairMapping(numAddresses);
    const allUtxos = [];

    for (let index = 0; index < numAddresses.length; index++) {
      const address = numAddresses[index] as string;
      const keyPair = addressKeyPairMapping[address];
      try {
        const data =
          await firoElectrum.getUnspentTransactionsByAddress(address);

        if (data.length > 0) {
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
    return { spendableUtxos: allUtxos, addressKeyPairs: addressKeyPairMapping };
  }

  async getOnlySpendableUtxos() {
    const address2Check = await this.getTransactionsAddresses();

    const utxos = await firoElectrum.multiGetUnspentTransactions(address2Check);

    const filteredUtxos = utxos.filter(utxo => utxo.confirmations > 0);

    return filteredUtxos.map((utxo: UnspentTxOutputModel) => ({
      ...utxo,
      index: utxo.vout,
    }));
  }

  async getPublicBalance(): Promise<BigNumber> {
    const address2Check = await this.getTransactionsAddresses();

    const utxos = await firoElectrum.multiGetUnspentTransactions(address2Check);
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

  async getSparkAddressAsync(): Promise<string | undefined> {
    const localStorage = new LocalStorageHelper(LOCAL_STORAGE_PREFIXES.wallet);

    if (!localStorage.exists(LOCAL_STORAGE_KEYS.sparkIndex)) {
      localStorage.set(LOCAL_STORAGE_KEYS.sparkIndex, 1);
    }

    const currentIndex = localStorage.get<number>(
      LOCAL_STORAGE_KEYS.sparkIndex,
    );

    const sparkState = await getSparkState(currentIndex);
    return sparkState?.defaultAddress;
  }

  skipAddress(): void {
    const localStorage = new LocalStorageHelper(LOCAL_STORAGE_PREFIXES.wallet);

    if (!localStorage.exists(LOCAL_STORAGE_KEYS.sparkIndex)) {
      localStorage.set(LOCAL_STORAGE_KEYS.sparkIndex, 1);
    }

    const currentIndex = localStorage.get<number>(
      LOCAL_STORAGE_KEYS.sparkIndex,
    );

    localStorage.set(LOCAL_STORAGE_KEYS.sparkIndex, currentIndex! + 1);
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

  async getUsedSparkCoinsTags(startPoint: number) {
    return await firoElectrum.getUsedCoinsTags(startPoint);
  }

  async getUsedCoinsTagsTxHashes(startNumber: number) {
    return await firoElectrum.getUsedCoinsTagsTxHashes(startNumber);
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

  async broadcastTransaction(hex: string): Promise<string> {
    return firoElectrum.broadcast(hex);
  }
}
