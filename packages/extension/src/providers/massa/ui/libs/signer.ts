import { InternalMethods, InternalOnMessageResponse } from '@/types/messenger';
import { bufferToHex } from '@enkryptcom/utils';
import sendUsingInternalMessengers from '@/libs/messenger/internal-messenger';
import { BaseNetwork } from '@/types/base-network';
import { EnkryptAccount } from '@enkryptcom/types';
import {
  Address,
  OperationManager,
  OperationType,
  PublicKey,
  TransferOperation,
} from '@massalabs/massa-web3';
import { MassaNetworkOptions } from '../../types';

export interface MassaTransactionOptions {
  account: EnkryptAccount;
  network: BaseNetwork;
  payload: {
    from: string;
    to: string;
    amount: string;
    fee: string;
    expirePeriod: number;
  };
}

export interface MassaSignedTransaction {
  from: string;
  to: string;
  amount: string;
  fee: string;
  expirePeriod: number;
  signature: string;
  publicKey: string;
  serializedHex: string;
}

/**
 * Sign a Massa transaction
 */
export const MassaTransactionSigner = (
  options: MassaTransactionOptions,
): Promise<MassaSignedTransaction> => {
  const { account, payload, network } = options;

  // Create the message to sign (similar to Ethereum's getHashedMessageToSign)
  const operationDetails: TransferOperation = {
    type: OperationType.Transaction,
    amount: BigInt(payload.amount),
    recipientAddress: Address.fromString(payload.to),
    fee: BigInt(payload.fee),
    expirePeriod: payload.expirePeriod, //3060678
  };
  const chainId = (network as MassaNetworkOptions).chainId;

  const publicKey = PublicKey.fromString(account.publicKey);
  const serialized = OperationManager.canonicalize(
    chainId!,
    operationDetails,
    publicKey,
  );
  const bufferTosign = bufferToHex(serialized);

  return sendUsingInternalMessengers({
    method: InternalMethods.sign,
    params: [bufferTosign, account],
  }).then(res => {
    if (res.error) {
      return Promise.reject(res);
    } else {
      const signature = JSON.parse(res.result as string) || '';

      const signedTx: MassaSignedTransaction = {
        ...payload,
        signature,
        publicKey: account.publicKey,
        serializedHex: bufferToHex(
          OperationManager.serialize(operationDetails),
        ),
      };

      return signedTx;
    }
  });
};

/**
 * Sign a Massa message
 */
export const MassaMessageSigner = (options: {
  account: EnkryptAccount;
  network: BaseNetwork;
  payload: Buffer;
}): Promise<InternalOnMessageResponse> => {
  const { account, payload } = options;

  const msgHash = bufferToHex(payload);
  return sendUsingInternalMessengers({
    method: InternalMethods.sign,
    params: [msgHash, account],
  }).then(res => {
    if (res.error) return res;
    return {
      result: res.result,
    };
  });
};
