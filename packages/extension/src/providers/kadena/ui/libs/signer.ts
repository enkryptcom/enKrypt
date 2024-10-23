import { InternalMethods, InternalOnMessageResponse } from '@/types/messenger';
import { SignerTransactionOptions } from '../types';
import { getCustomError } from '@/libs/error';
import sendUsingInternalMessengers from '@/libs/messenger/internal-messenger';

const TransactionSigner = (
  options: SignerTransactionOptions,
): Promise<InternalOnMessageResponse> => {
  const { account, payload } = options;
  if (account.isHardware) {
    return new Promise((resolve, reject) => {
      reject(getCustomError('NOT_IMPLEMENTED'));
    });
  } else {
    return sendUsingInternalMessengers({
      method: InternalMethods.sign,
      params: [payload, account],
    }).then(res => {
      if (res.error) return res;
      return {
        result: JSON.parse(res.result as string),
      };
    });
  }
};

export { TransactionSigner };
