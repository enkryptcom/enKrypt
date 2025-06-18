import { MultiversXRawInfo } from '@/types/activity';
import { ProviderAPIInterface } from '@/types/provider';
import { Address, ApiNetworkProvider } from '@multiversx/sdk-core';
import { numberToHex } from 'web3-utils';

/** MultiversX API wrapper */
class API implements ProviderAPIInterface {
  node: string;
  networkProvider: ApiNetworkProvider;

  constructor(node: string) {
    this.node = node;
    this.networkProvider = new ApiNetworkProvider(node);
  }

  async init(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public get api() {
    return this;
  }

  async getBalance(pubkey: string): Promise<string> {
    const balance = (await this.networkProvider.getAccount(new Address(pubkey)))
      .balance;
    return numberToHex(new BigNumber(balance).toFixed());
  }

  async getTransactionStatus(hash: string): Promise<MultiversXRawInfo | null> {
    let rawTx: Record<string, any>;

    try {
      rawTx = (await this.networkProvider.getTransaction(hash)).raw;
    } catch {
      // Transaction can't be fetched
      return null;
    }

    if (!rawTx) {
      return null;
    }

    const returnValue: MultiversXRawInfo = {
      transactionHash: rawTx.hash,
      timestamp: rawTx.timestamp,
      gasLimit: rawTx.gasLimit,
      gasPrice: rawTx.gasPrice,
      from: rawTx.sender,
      to: rawTx.receiver,
      value: rawTx.value,
      nonce: rawTx.nonce,
      data: rawTx.data,
      status: rawTx.status,
    };
    return returnValue;
  }

  async broadcastTx(_rawtx: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

export default API;
