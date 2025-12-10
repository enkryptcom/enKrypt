import { BaseFiroWallet } from './base-firo-wallet';

export class PublicFiroWallet {
  #wallet: BaseFiroWallet;

  constructor() {
    this.#wallet = new BaseFiroWallet();
  }

  async getSparkAddressAsync() {
    return this.#wallet.getSparkAddressAsync();
  }

  skipAddress() {
    return this.#wallet.skipAddress();
  }

  async getTransactionsAddresses() {
    return this.#wallet.getTransactionsAddresses();
  }

  async getPublicBalance() {
    return this.#wallet.getPublicBalance();
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

  getSecret() {
    return this.#wallet.getSecret();
  }

  async getAllSparkAnonymitySetMeta() {
    return this.#wallet.getAllSparkAnonymitySetMeta();
  }

  async broadcastTransaction(hex: string): Promise<string> {
    return this.#wallet.broadcastTransaction(hex);
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
}
