import { InternalMethods, InternalOnMessageResponse } from '@/types/messenger';
import { SignerTransactionOptions } from '../../types';
import HWwallet from '@enkryptcom/hw-wallets';
import { HWwalletType } from '@enkryptcom/types';
import { getCustomError } from '@/libs/error';
import { bufferToHex, hexToBuffer } from '@enkryptcom/utils';
import sendUsingInternalMessengers from '@/libs/messenger/internal-messenger';

/**
 * Sign a transaction
 */
const TransactionSigner = (
  options: SignerTransactionOptions,
): Promise<Buffer> => {
  const { transaction, network, account } = options;
  if (account.isHardware) {
    const hwwallets = new HWwallet();
    return hwwallets
      .signTransaction({
        transaction: { massaTx: transaction },
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
  options: { payload: string; account: any; network: any },
): Promise<InternalOnMessageResponse> => {
  const { account, payload } = options;
  if (account.isHardware) {
    return Promise.reject({
      error: getCustomError('massa-hw-sign: hw wallets not supported for message signing'),
    });
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