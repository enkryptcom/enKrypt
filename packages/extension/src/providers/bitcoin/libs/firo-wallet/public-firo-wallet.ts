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

  async getUsedSparkCoinsTags(startPoint: number) {
    return this.#wallet.getUsedSparkCoinsTags(startPoint);
  }

  async getUsedCoinsTagsTxHashes() {
    return this.#wallet.getUsedCoinsTagsTxHashes();
  }

  async getOnlySpendableUtxos() {
    return this.#wallet.getOnlySpendableUtxos();
  }

  async getSparkMintMetadata(coinHashes: string[]) {
    return this.#wallet.getSparkMintMetadata(coinHashes);
  }

  async fetchAllAnonymitySets() {
    return this.#wallet.fetchAllAnonymitySets();
  }

  getSecret() {
    return this.#wallet.getSecret();
  }

  async getAllSparkAnonymitySetMeta() {
    return this.#wallet.getAllSparkAnonymitySetMeta();
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
