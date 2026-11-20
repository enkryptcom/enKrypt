import BrowserStorage from '@/libs/common/browser-storage';
import { InternalStorageNamespace } from '@/types/provider';
import { ProviderError } from '@enkryptcom/types';

/** Wrong passwords in a row before unlocking is blocked. */
export const MAX_UNLOCK_ATTEMPTS = 10;
/** How long unlocking stays blocked once the limit is hit. */
export const UNLOCK_LOCK_DURATION_MS = 60_000;
/** Error code returned by `unlock` while blocked; `data.lockedUntil` says until when. */
export const UNLOCK_LOCKED_ERROR_CODE = 8547;

export interface UnlockLockoutState {
  failedAttempts: number;
  /** Epoch ms; 0 when not locked. */
  lockedUntil: number;
}

const STATE_KEY = 'state';

/**
 * Brute-force throttle for the keyring password. Lives in the background and
 * in extension storage, so it covers every unlock caller and survives the
 * popup (and the service worker) restarting.
 */
class UnlockLockout {
  #storage = new BrowserStorage(InternalStorageNamespace.unlockLockout);

  async getState(): Promise<UnlockLockoutState> {
    const state: UnlockLockoutState | null = await this.#storage.get(STATE_KEY);
    if (!state) return { failedAttempts: 0, lockedUntil: 0 };
    // A lock that has run out starts a fresh count.
    if (state.lockedUntil && state.lockedUntil <= Date.now()) {
      await this.reset();
      return { failedAttempts: 0, lockedUntil: 0 };
    }
    return state;
  }

  /** Remaining lock end time, or 0 when unlocking is allowed. */
  async getLockedUntil(): Promise<number> {
    return (await this.getState()).lockedUntil;
  }

  /** Counts a wrong password; returns the lock end time if this one hit the limit. */
  async recordFailure(): Promise<number> {
    const state = await this.getState();
    state.failedAttempts += 1;
    if (state.failedAttempts >= MAX_UNLOCK_ATTEMPTS) {
      state.lockedUntil = Date.now() + UNLOCK_LOCK_DURATION_MS;
    }
    await this.#storage.set(STATE_KEY, state);
    return state.lockedUntil;
  }

  async reset(): Promise<void> {
    await this.#storage.remove(STATE_KEY);
  }
}

export const getLockedError = (lockedUntil: number): ProviderError => ({
  code: UNLOCK_LOCKED_ERROR_CODE,
  message: `${UNLOCK_LOCKED_ERROR_CODE}: too many failed unlock attempts`,
  data: { lockedUntil },
});

export default UnlockLockout;
