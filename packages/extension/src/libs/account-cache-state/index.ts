import { InternalStorageNamespace } from '@/types/provider';
import BrowserStorage from '../common/browser-storage';
import { CachedAccountInfo, IState, StorageKeys } from './types';

/**
 * Stores what the popup last showed for each account, so that it can be shown
 * again before fresh data arrives. Entries saved by another version of the
 * extension are ignored, because the paths of bundled icons and the shape of an
 * entry can change between versions.
 */
class AccountCacheState {
  #storage: BrowserStorage;
  constructor() {
    this.#storage = new BrowserStorage(
      InternalStorageNamespace.accountCacheState,
    );
  }
  async getEntries(): Promise<Record<string, CachedAccountInfo>> {
    const state: IState | null = await this.#storage.get(
      StorageKeys.accountCache,
    );
    if (!state || state.version !== __PACKAGE_VERSION__) return {};
    return state.entries;
  }
  async setEntries(entries: Record<string, CachedAccountInfo>): Promise<void> {
    const state: IState = { version: __PACKAGE_VERSION__, entries };
    await this.#storage.set(StorageKeys.accountCache, state);
  }
}
export default AccountCacheState;
