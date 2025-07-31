import { InternalMethods, InternalOnMessageResponse } from '@/types/messenger';
import { bufferToHex, hexToBuffer } from '@enkryptcom/utils';
import sendUsingInternalMessengers from '@/libs/messenger/internal-messenger';
import { BaseNetwork } from '@/types/base-network';
import { EnkryptAccount } from '@enkryptcom/types';
import {
  Address,
  CallOperation,
  MAX_GAS_CALL,
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
    type: OperationType;
    from: string;
    to: string;
    amount: string;
    fee: string;
    expirePeriod: number;
    data?: string;
    maxGas?: string;
    coins?: string;
    func?: string;
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

  let operationDetails: TransferOperation | CallOperation;
  if (payload.type === OperationType.Transaction) {
    operationDetails = {
      type: payload.type,
      amount: BigInt(payload.amount),
      recipientAddress: Address.fromString(payload.to),
      fee: BigInt(payload.fee),
      expirePeriod: payload.expirePeriod,
    };
  } else if (payload.type === OperationType.CallSmartContractFunction) {
    if (!payload.func) {
      throw new Error('Invalid payload, target function is required');
    }
    operationDetails = {
      type: payload.type,
      parameter: hexToBuffer(payload.data ?? ''),
      fee: BigInt(payload.fee),
      expirePeriod: payload.expirePeriod,
      maxGas: BigInt(payload.maxGas ?? MAX_GAS_CALL),
      coins: BigInt(payload.coins ?? '0'),
      address: payload.to,
      func: payload.func,
    };
  } else {
    throw new Error(`Unsupported operation type: ${payload.type}`);
  }

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
