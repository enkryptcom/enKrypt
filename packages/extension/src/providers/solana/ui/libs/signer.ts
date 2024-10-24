import { InternalMethods, InternalOnMessageResponse } from '@/types/messenger';
import {
  SolInternalSignMessageRequest,
  SolInternalSignTransactionRequest,
} from '../types';
import HWwallet from '@enkryptcom/hw-wallets';
import { HWwalletType } from '@enkryptcom/types';
import { getCustomError } from '@/libs/error';
import { bufferToHex, hexToBuffer } from '@enkryptcom/utils';
import sendUsingInternalMessengers from '@/libs/messenger/internal-messenger';

/**
 * Sign a transaction
 */
const TransactionSigner = (
  options: SolInternalSignTransactionRequest,
): Promise<Buffer> => {
  const { transaction, network, account } = options;
  if (options.account.isHardware) {
    const hwwallets = new HWwallet();
    return hwwallets
      .signTransaction({
        transaction: { solTx: transaction },
        networkName: network.name,
        pathIndex: account.pathIndex.toString(),
        pathType: {
          basePath: account.basePath,
          path: account.HWOptions!.pathTemplate,
        },
        wallet: account.walletType as unknown as HWwalletType,
      })
      .then((rpcsig: string) => {
        return hexToBuffer(rpcsig);
      })
      .catch(e => {
        return Promise.reject({
          error: getCustomError(e.message),
        });
      });
  } else {
    const msgHash = bufferToHex(transaction);
    return sendUsingInternalMessengers({
      method: InternalMethods.sign,
      params: [msgHash, account],
    }).then(res => {
      if (res.error) {
        return Promise.reject(res);
      } else {
        return hexToBuffer(JSON.parse(res.result!));
      }
    });
  }
};

/**
 * Sign a message
 */
const MessageSigner = (
  options: SolInternalSignMessageRequest,
): Promise<InternalOnMessageResponse> => {
  const { account, payload } = options;
  if (account.isHardware) {
    return Promise.reject({
      error: getCustomError('solana-hw-sign: hw wallets not supported'),
    });
    // only ledger supports offchain message signing but it is not widely accepted yet, will visit later
    // https://github.com/anza-xyz/wallet-standard/blob/master/packages/core/util/src/signMessage.ts
    // const hwwallets = new HWwallet();
    // const hwSignMessage = createOffChainMessage(
    //   hexToBuffer(payload).toString("utf8")
    // );
    // return hwwallets
    //   .signPersonalMessage({
    //     message: hwSignMessage,
    //     networkName: network.name,
    //     pathIndex: account.pathIndex.toString(),
    //     pathType: {
    //       basePath: account.basePath,
    //       path: account.HWOptions!.pathTemplate,
    //     },
    //     wallet: account.walletType as unknown as HWwalletType,
    //   })
    //   .then((res: string) => ({
    //     result: JSON.stringify({
    //       signature: res,
    //       message: bufferToHex(hwSignMessage),
    //     }),
    //   }))
    //   .catch((e: any) => {
    //     return Promise.reject({
    //       error: getCustomError(e.message),
    //     });
    //   });
  } else {
    return sendUsingInternalMessengers({
      method: InternalMethods.sign,
      params: [payload, account],
    }).then(res => {
      if (res.error) return res;
      return {
        result: JSON.stringify({
          signature: JSON.parse(res.result!),
          message: payload,
        }),
      };
    });
  }
};

export { TransactionSigner, MessageSigner };
