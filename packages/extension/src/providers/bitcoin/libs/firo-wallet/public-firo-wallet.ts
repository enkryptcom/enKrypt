import { BaseFiroWallet } from './base-firo-wallet';

export class PublicFiroWallet {
  #wallet: BaseFiroWallet;

  constructor() {
    this.#wallet = new BaseFiroWallet();
  }

  async getTransactionsAddresses() {
    return this.#wallet.getTransactionsAddresses();
  }

  async getPublicBalance() {
    return this.#wallet.getPublicBalance();
  }

  async getSpendableUtxos(numAddresses: string[]) {
    return this.#wallet.getSpendableUtxos(numAddresses);
  }

  async getOnlySpendableUtxos() {
    return this.#wallet.getOnlySpendableUtxos();
  }
}
