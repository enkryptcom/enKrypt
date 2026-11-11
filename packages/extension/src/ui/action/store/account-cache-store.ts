/**
 * @file Remembers what the popup last showed for each account.
 *
 * The balance block and the assets list show an entry of this store until fresh
 * data arrives, and save what they load. AccountCacheState keeps the entries in
 * browser storage. Nothing else reads them: the balances in the accounts store
 * are never filled from here, so send and swap only ever see loaded balances.
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import AccountCacheState from '@/libs/account-cache-state';
import { CachedAccountInfo } from '@/libs/account-cache-state/types';
import { useAccountsStore } from './accounts-store';
import { useNetworksStore } from './networks-store';

/** How many entries are kept. The ones saved longest ago are removed first. */
const MAX_ENTRIES = 30;

type Entries = Record<string, CachedAccountInfo>;

/** The most recently saved entries, newest first. */
const newest = (entries: [string, CachedAccountInfo][]): Entries =>
  Object.fromEntries(
    entries
      .sort(([, a], [, b]) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_ENTRIES),
  );

/**
 * Defines the store for the cached account info. The networks store loads it
 * when the popup is initialised.
 *
 * @property {Ref<Record<string, CachedAccountInfo>>} entries - The cached entries by key.
 *
 * @computed {ComputedRef<string>} currentKey - Key of the selected account on the current network and sub-network, '' when no account is selected.
 * @computed {ComputedRef<CachedAccountInfo | undefined>} currentEntry - The entry of the current selection.
 *
 * @method {Function} keyFor - Builds the key of an account on a network and sub-network.
 * @method {Function} load - Reads the saved entries.
 * @method {Function} save - Updates an entry and saves the entries.
 */
export const useAccountCacheStore = defineStore('useAccountCacheStore', () => {
  const cacheState = new AccountCacheState();
  const entries = ref<Entries>({});
  /** The read of the saved entries. It is made once and shared by every load() call. */
  let loading: Promise<void> | null = null;
  /** Writes of the entries, run one at a time in the order they were made. */
  let saving: Promise<void> = Promise.resolve();

  /**
   * @method keyFor - Builds the key of an account on a network and sub-network.
   * @param networkName - Name of the network
   * @param subNetworkId - Id of the sub-network, '' when the network has none
   * @param address - Address of the account
   */
  const keyFor = (networkName: string, subNetworkId: string, address: string) =>
    [networkName, subNetworkId, address].join('|');

  const currentKey = computed(() => {
    const networksStore = useNetworksStore();
    const address = useAccountsStore().selectedAccount?.address;
    if (!address) return '';
    return keyFor(
      networksStore.currentNetwork.name,
      networksStore.currentSubNetwork,
      address,
    );
  });

  const currentEntry = computed<CachedAccountInfo | undefined>(
    () => entries.value[currentKey.value],
  );

  /**
   * @method load - Reads the saved entries. Storage is read once; later calls
   * return the same promise, so entries saved in the meantime are not replaced.
   * A read that fails is logged and leaves the store empty.
   */
  const load = () => {
    loading ??= cacheState
      .getEntries()
      .then(saved => {
        // Values saved before the read finished are newer than the stored ones.
        // The other stored values of those entries are kept.
        const merged = { ...saved };
        for (const [key, entry] of Object.entries(entries.value)) {
          merged[key] = { ...saved[key], ...entry };
        }
        entries.value = newest(Object.entries(merged));
      })
      .catch(console.error);
    return loading;
  };

  /**
   * @method save - Updates an entry with new values and saves the entries.
   * The other values of the entry are kept. A write that fails is logged.
   * @param key - Key from keyFor or currentKey. Nothing is saved for ''.
   * @param values - The values that were loaded
   */
  const save = (
    key: string,
    values: Partial<Omit<CachedAccountInfo, 'updatedAt'>>,
  ) => {
    if (!key) return saving;
    const entry = { ...entries.value[key], ...values, updatedAt: Date.now() };
    const others = Object.entries(entries.value).filter(([k]) => k !== key);
    // The saved entry goes first, so that it is kept when timestamps are equal
    entries.value = newest([[key, entry], ...others]);
    saving = saving
      .then(load)
      // Storage needs plain data, and the entries can hold reactive proxies
      .then(() =>
        cacheState.setEntries(JSON.parse(JSON.stringify(entries.value))),
      )
      .catch(console.error);
    return saving;
  };

  return {
    entries,
    currentKey,
    currentEntry,
    keyFor,
    load,
    save,
  };
});
