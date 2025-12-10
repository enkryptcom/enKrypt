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

  getSparkAddressAsync() {
    return this.#wallet.getSparkAddressAsync();
  }

  skipAddress() {
    return this.#wallet.skipAddress();
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

  async getAddressKeyPairMapping(numAddresses: string[]) {
    return this.#wallet.getAddressKeyPairMapping(numAddresses);
  }

  async getSpendableUtxos(numAddresses: string[]) {
    return this.#wallet.getSpendableUtxos(numAddresses);
  }

  async getUsedSparkCoinsTags(startPoint: number) {
    return this.#wallet.getUsedSparkCoinsTags(startPoint);
  }

  async getUsedCoinsTagsTxHashes(startNumber: number) {
    return this.#wallet.getUsedCoinsTagsTxHashes(startNumber);
  }

  async getOnlySpendableUtxos() {
    return this.#wallet.getOnlySpendableUtxos();
  }

  async getAllSparkAnonymitySetMeta() {
    return this.#wallet.getAllSparkAnonymitySetMeta();
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
