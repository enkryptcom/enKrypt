import MultiversXAPI from '@/providers/multiversx/libs/api';
import { BaseToken, BaseTokenOptions } from '@/types/base-token';
import { EnkryptAccount } from '@enkryptcom/types';
import { bufferToHex } from '@enkryptcom/utils';
import {
  Address,
  GasLimitEstimator,
  Token,
  TokenComputer,
  TokenTransfer,
  Transaction,
  TransactionComputer,
  TransactionsFactoryConfig,
  TransferTransactionsFactory,
} from '@multiversx/sdk-core';
import { TransactionSigner } from '../ui/libs/signer';
import { MultiversXNetwork } from './mvx-network';

export interface MvxTokenOptions extends BaseTokenOptions {
  type: string;
}

export class MVXToken extends BaseToken {
  public type: string;

  constructor(options: MvxTokenOptions) {
    super(options);
    this.type = options.type;
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
    token: MVXToken,
    amount: string,
    network: MultiversXNetwork,
  ): Promise<Transaction> {
    to = network.displayAddress(to);

    const api = (await network.api()) as MultiversXAPI;
    const chainID = await api.getChainId();

    const factoryConfig = new TransactionsFactoryConfig({ chainID });
    const gasEstimator = new GasLimitEstimator({
      networkProvider: api.networkProvider,
      gasMultiplier: 1.1,
    });
    const transferFactory = new TransferTransactionsFactory({
      config: factoryConfig,
      gasLimitEstimator: gasEstimator,
    });

    const sender = Address.newFromBech32(from.address);
    const receiver = Address.newFromBech32(to);

    let transaction: Transaction;

    if (token.type === 'native') {
      transaction = await transferFactory.createTransactionForTransfer(sender, {
        receiver,
        nativeAmount: BigInt(amount),
      });
    } else {
      console.info('token: ', token);
      const tokenComputer = new TokenComputer();
      const identifier = tokenComputer.extractIdentifierFromExtendedIdentifier(
        token.symbol,
      );
      const nonce = tokenComputer.extractNonceFromExtendedIdentifier(
        token.symbol,
      );

      const tokenObj = new Token({
        identifier: identifier,
        nonce: BigInt(nonce.toString()),
      });

      const transfer = new TokenTransfer({
        token: tokenObj,
        amount: BigInt(amount),
      });

      transaction = await transferFactory.createTransactionForESDTTokenTransfer(
        sender,
        {
          receiver,
          tokenTransfers: [transfer],
        },
      );
    }

    console.info('transaction before signing: ', transaction.toPlainObject());

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
