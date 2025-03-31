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

  async getOnlySpendableUtxos() {
    return this.#wallet.getOnlySpendableUtxos();
  }
}
