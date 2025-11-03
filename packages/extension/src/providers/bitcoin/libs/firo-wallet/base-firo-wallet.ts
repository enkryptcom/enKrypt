import BrowserStorage from '@/libs/common/browser-storage';
import { InternalStorageNamespace } from '@/types/provider';

import { FiroWallet } from './firo-wallet';

export class BaseFiroWallet {
  #wallet: FiroWallet;

  constructor() {
    const browserStorage = new BrowserStorage(
      InternalStorageNamespace.firoWallet,
    );
    this.#wallet = new FiroWallet(browserStorage);
  }

  getTransactionsAddresses() {
    return this.#wallet.getTransactionsAddresses();
  }

  getPublicBalance() {
    return this.#wallet.getPublicBalance();
  }

  setSecret(mnemonic: string) {
    this.#wallet.setSecret(mnemonic);
  }

  async getSpendableUtxos(numAddresses: string[]) {
    return this.#wallet.getSpendableUtxos(numAddresses);
  }

  async getUsedSparkCoinsTags(startPoint: number) {
    return this.#wallet.getUsedSparkCoinsTags(startPoint);
  }

  async getUsedCoinsTagsTxHashes() {
    return this.#wallet.getUsedCoinsTagsTxHashes();
  }

  async getOnlySpendableUtxos() {
    return this.#wallet.getOnlySpendableUtxos();
  }

  async fetchAllAnonymitySets() {
    return this.#wallet.fetchAllAnonymitySets();
  }

  async getAllSparkAnonymitySetMeta() {
    return this.#wallet.getAllSparkAnonymitySetMeta();
  }

  async getSparkMintMetadata(coinHashes: string[]) {
    return this.#wallet.getSparkMintMetadata(coinHashes);
  }

  getSecret() {
    return this.#wallet.getSecret();
  }

  async fetchAnonymitySetSector(
    setId: number,
    latestBlockHash: string,
    startIndex: number,
    endIndex: number,
  ) {
    return this.#wallet.fetchAnonymitySetSector(
      setId,
      latestBlockHash,
      startIndex,
      endIndex,
    );
  }

  async broadcastTransaction(hex: string) {
    return this.#wallet.broadcastTransaction(hex);
  }
}
