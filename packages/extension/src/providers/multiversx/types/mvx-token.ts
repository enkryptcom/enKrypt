import MultiversXAPI from '@/providers/multiversx/libs/api';
import { BaseToken, BaseTokenOptions } from '@/types/base-token';
import { EnkryptAccount } from '@enkryptcom/types';
import { bufferToHex } from '@enkryptcom/utils';
import {
  Address,
  Transaction,
  TransactionComputer,
  TransactionsFactoryConfig,
  TransferTransactionsFactory,
} from '@multiversx/sdk-core';
import { TransactionSigner } from '../ui/libs/signer';
import { MultiversXNetwork } from './mvx-network';

export class MVXToken extends BaseToken {
  constructor(options: BaseTokenOptions) {
    super(options);
  }

  public async getLatestUserBalance(
    api: MultiversXAPI,
    pubkey: string,
  ): Promise<string> {
    return api.getBalance(pubkey);
  }

  public async getBalance(api: MultiversXAPI, pubkey: string): Promise<string> {
    return this.getLatestUserBalance(api, pubkey);
  }

  public async send(): Promise<any> {
    throw new Error('send is not implemented here');
  }

  public async buildTransaction(
    to: string,
    from: EnkryptAccount | any,
    amount: string,
    network: MultiversXNetwork,
  ): Promise<Transaction> {
    to = network.displayAddress(to);

    const api = (await network.api()) as MultiversXAPI;
    const chainID = await api.getChainId();

    const factoryConfig = new TransactionsFactoryConfig({ chainID });
    const transferFactory = new TransferTransactionsFactory({
      config: factoryConfig,
    });

    const sender = Address.newFromBech32(from.address);
    const receiver = Address.newFromBech32(to);

    const transaction = transferFactory.createTransactionForTransfer(sender, {
      receiver,
      nativeAmount: BigInt(amount),
    });

    transaction.nonce = await api.getAccountNonce(sender);

    const txComputer = new TransactionComputer();
    txComputer.applyOptionsForHashSigning(transaction);

    const signature = await TransactionSigner({
      account: from,
      network: network,
      payload: bufferToHex(txComputer.computeHashForSigning(transaction)),
    }).then(res => {
      if (res.error) return Promise.reject(res.error);
      else return res.result?.replace('0x', '') as string;
    });

    transaction.signature = Buffer.from(signature, 'hex');
    return transaction;
  }
}
