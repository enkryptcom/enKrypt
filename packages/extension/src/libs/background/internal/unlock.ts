import { getCustomError } from '@/libs/error';
import KeyRingBase from '@/libs/keyring/keyring';
import { InternalOnMessageResponse } from '@/types/messenger';
import { RPCRequestType } from '@enkryptcom/types';
import { initAccounts } from '@/libs/utils/initialize-wallet';

const unlock = (
  keyring: KeyRingBase,
  message: RPCRequestType,
): Promise<InternalOnMessageResponse> => {
  if (!message.params || message.params.length < 1)
    return Promise.resolve({
      error: getCustomError('background: invalid params for unlocking'),
    });
  const password = message.params[0] as string;
  const initNewAccounts = (message.params[1] as boolean) ?? false;
  return keyring
    .unlock(password)
    .then(async () => {
      if (initNewAccounts) {
        await initAccounts(keyring);
      }
      return {
        result: JSON.stringify(true),
      };
    })
    .catch(e => {
      return {
        error: getCustomError(e.message),
      };
    });
};

export default unlock;
