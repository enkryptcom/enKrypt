import { getCustomError } from '@/libs/error';
import KeyRingBase from '@/libs/keyring/keyring';
import { InternalOnMessageResponse } from '@/types/messenger';
import { RPCRequestType } from '@enkryptcom/types';
import { initAccounts } from '@/libs/utils/initialize-wallet';
import UnlockLockout, { getLockedError } from '@/libs/unlock-lockout';

const lockout = new UnlockLockout();

// Unlock attempts run one at a time, so parallel requests can't race the
// failure counter (read-modify-write in storage) and slip past the limit.
let queue: Promise<unknown> = Promise.resolve();

const unlock = (
  keyring: KeyRingBase,
  message: RPCRequestType,
): Promise<InternalOnMessageResponse> => {
  const run = queue.then(() => attemptUnlock(keyring, message));
  queue = run.catch(() => undefined);
  return run;
};

const attemptUnlock = async (
  keyring: KeyRingBase,
  message: RPCRequestType,
): Promise<InternalOnMessageResponse> => {
  if (!message.params || message.params.length < 1)
    return {
      error: getCustomError('background: invalid params for unlocking'),
    };

  // Refuse before touching the keyring, so a locked-out caller learns nothing.
  const lockedUntil = await lockout.getLockedUntil();
  if (lockedUntil) return { error: getLockedError(lockedUntil) };

  const password = message.params[0] as string;
  const initNewAccounts = (message.params[1] as boolean) ?? false;
  return keyring
    .unlock(password)
    .then(async () => {
      await lockout.reset();
      if (initNewAccounts) {
        await initAccounts(keyring);
      }
      return {
        result: JSON.stringify(true),
      };
    })
    .catch(async e => {
      const nowLockedUntil = await lockout.recordFailure();
      if (nowLockedUntil) return { error: getLockedError(nowLockedUntil) };
      return {
        error: getCustomError(e.message),
      };
    });
};

export const getUnlockLockout =
  async (): Promise<InternalOnMessageResponse> => ({
    result: JSON.stringify({ lockedUntil: await lockout.getLockedUntil() }),
  });

export default unlock;
