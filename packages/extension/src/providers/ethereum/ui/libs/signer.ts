import { InternalMethods, InternalOnMessageResponse } from '@/types/messenger';
import { FeeMarketEIP1559Transaction, LegacyTransaction } from '@ethereumjs/tx';
import {
  SignerTransactionOptions,
  SignerMessageOptions,
  SignerTypedMessageOptions,
} from '../types';
import HWwallet from '@enkryptcom/hw-wallets';
import { HWwalletType } from '@enkryptcom/types';
import { fromRpcSig, hashPersonalMessage } from '@ethereumjs/util';
import { getCustomError } from '@/libs/error';
import { bufferToHex } from '@enkryptcom/utils';
import sendUsingInternalMessengers from '@/libs/messenger/internal-messenger';
import {
  SignTypedDataVersion,
  TypedDataUtils,
  typedSignatureHash,
} from '@metamask/eth-sig-util';

/**
 * Sign a transaction
 */
const TransactionSigner = (
  options: SignerTransactionOptions,
): Promise<LegacyTransaction | FeeMarketEIP1559Transaction> => {
  const { account, network, payload } = options;
  if (account.isHardware) {
    const hwwallets = new HWwallet();
    return hwwallets
      .signTransaction({
        transaction: payload as any,
        networkName: network.name,
        pathIndex: account.pathIndex.toString(),
        pathType: {
          basePath: account.basePath,
          path: account.HWOptions!.pathTemplate,
        },
        wallet: account.walletType as unknown as HWwalletType,
      })
      .then((rpcsig: string) => {
        const rpcSig = fromRpcSig(rpcsig as `0x${string}`);
        const signedTx = payload.addSignature(
          BigInt(rpcSig.v),
          rpcSig.r,
          rpcSig.s,
          true,
        );
        return signedTx;
      })
      .catch(e => {
        return Promise.reject({
          error: getCustomError(e.message),
        });
      });
  } else {
    const msgHash = bufferToHex(payload.getHashedMessageToSign());
    return sendUsingInternalMessengers({
      method: InternalMethods.sign,
      params: [msgHash, account],
    }).then(res => {
      if (res.error) {
        return Promise.reject(res);
      } else {
        const rpcSig = fromRpcSig(JSON.parse(res.result as string) || '0x');
        const signedTx = payload.addSignature(
          rpcSig.v,
          rpcSig.r,
          rpcSig.s,
          true,
        );
        return signedTx;
      }
    });
  }
};

/**
 * Sign a message
 */
const MessageSigner = (
  options: SignerMessageOptions,
): Promise<InternalOnMessageResponse> => {
  const { account, network, payload } = options;
  if (account.isHardware) {
    const hwwallets = new HWwallet();
    return hwwallets
      .signPersonalMessage({
        message: payload,
        networkName: network.name,
        pathIndex: account.pathIndex.toString(),
        pathType: {
          basePath: account.basePath,
          path: account.HWOptions!.pathTemplate,
        },
        wallet: account.walletType as unknown as HWwalletType,
      })
      .then((res: string) => ({
        result: JSON.stringify(res),
      }))
      .catch((e: any) => {
        return Promise.reject({
          error: getCustomError(e.message),
        });
      });
  } else {
    const msgHash = bufferToHex(hashPersonalMessage(payload));
    return sendUsingInternalMessengers({
      method: InternalMethods.sign,
      params: [msgHash, account],
    }).then(res => {
      if (res.error) return res;
      return {
        result: res.result,
      };
    });
  }
};

const TypedMessageSigner = (
  options: SignerTypedMessageOptions,
): Promise<InternalOnMessageResponse> => {
  const { account, network, typedData, version } = options;
  if (account.isHardware) {
    if ((version as any) === SignTypedDataVersion.V1) {
      return Promise.reject({
        error: getCustomError(
          'Hardware wallets do not support V1 typed data signing',
        ),
      });
    }
    const hwwallets = new HWwallet();
    return hwwallets
      .signTypedMessage({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        version: version,
        message: typedData.message,
        networkName: network.name,
        pathIndex: account.pathIndex.toString(),
        pathType: {
          basePath: account.basePath,
          path: account.HWOptions!.pathTemplate,
        },
        wallet: account.walletType as unknown as HWwalletType,
      })
      .then((res: string) => ({
        result: JSON.stringify(res),
      }))
      .catch((e: any) => {
        return Promise.reject({
          error: getCustomError(e.message),
        });
      });
  } else {
    const version = options.version as SignTypedDataVersion;
    const typedData = options.typedData;
    let msgHash;
    try {
      if (version === SignTypedDataVersion.V1) {
        msgHash = typedSignatureHash(typedData);
      } else {
        msgHash = bufferToHex(TypedDataUtils.eip712Hash(typedData, version));
      }
    } catch (e: any) {
      return Promise.reject({
        error: getCustomError(e.message),
      });
    }
    return sendUsingInternalMessengers({
      method: InternalMethods.sign,
      params: [msgHash, account],
    }).then(res => {
      if (res.error) return res;
      return {
        result: res.result,
      };
    });
  }
};

export { TransactionSigner, MessageSigner, TypedMessageSigner };
