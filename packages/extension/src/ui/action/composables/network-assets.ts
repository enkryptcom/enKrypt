import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { AssetsType } from '@/types/provider';
import { CachedAsset } from '@/libs/account-cache-state/types';
import { useNetworksStore } from '../store/networks-store';
import { useAccountsStore } from '../store/accounts-store';
import { useAccountCacheStore } from '../store/account-cache-store';

/** baseToken is a class instance and cannot be stored, so it is left out. */
const toCachedAsset = (asset: AssetsType): CachedAsset => {
  const cached = { ...asset };
  delete cached.baseToken;
  return cached;
};

/**
 * The assets of the selected account on the current network.
 *
 * The list is loaded when the view is created and again whenever the account,
 * the network or the sub-network changes. While it loads, the list that was last
 * saved for the selection in the account cache is shown. A list that arrives
 * after the selection has changed is saved for the selection it was loaded for
 * and is not shown. Only a complete list is saved, so a saved list always has
 * rows to show.
 */
export default () => {
  const { currentNetwork: network, currentSubNetwork } =
    storeToRefs(useNetworksStore());
  const { selectedAccount } = storeToRefs(useAccountsStore());
  const accountCacheStore = useAccountCacheStore();
  const { currentKey, currentEntry } = storeToRefs(accountCacheStore);
  const assets = ref<AssetsType[]>([]);
  /**
   * Counts the lists that have been shown. A row of the list builds its chart
   * once, when it is created, so the view keys its rows by this number to create
   * them again for each list.
   */
  const listVersion = ref(0);
  const isLoading = ref(false);
  const isFetchError = ref(false);
  /** Counts updateAssets calls, so that a slow call cannot overwrite a later one. */
  let lastRequest = 0;

  /** Shows a list. The list is set nowhere else, so every list gets its own version. */
  const showList = (list: AssetsType[]) => {
    assets.value = list;
    listVersion.value++;
  };

  const updateAssets = () => {
    const request = ++lastRequest;
    const key = currentKey.value;
    const cachedAssets = currentEntry.value?.assets;
    isFetchError.value = false;
    isLoading.value = !cachedAssets;
    showList(cachedAssets ? [...cachedAssets] : []);
    const address = selectedAccount.value?.address;
    if (!address) return;
    const isShown = () => request === lastRequest && key === currentKey.value;
    network.value
      .getAllTokenInfo(address)
      .then(_assets => {
        // A list for a selection that is no longer current still belongs to its
        // own entry. A list that a later one for the same selection has replaced
        // is dropped.
        const isForItsEntry = isShown() || key !== currentKey.value;
        // Every network puts its own coin in the list. A list that is empty or
        // has a missing asset comes from a lookup that failed in part, so it is
        // not saved.
        const isComplete =
          _assets.length > 0 && _assets.every(asset => !!asset);
        if (isForItsEntry && isComplete) {
          accountCacheStore.save(key, { assets: _assets.map(toCachedAsset) });
        }
        if (!isShown()) return;
        showList(_assets);
        isLoading.value = false;
      })
      .catch(e => {
        console.error(e);
        if (!isShown()) return;
        isFetchError.value = true;
        isLoading.value = false;
        showList([]);
      });
  };

  const selectedAddress = computed(() => selectedAccount.value?.address || '');
  const selectedNetworkName = computed(() => network.value.name);
  watch([selectedAddress, selectedNetworkName, currentSubNetwork], () =>
    updateAssets(),
  );
  onMounted(updateAssets);

  return { assets, listVersion, isLoading, isFetchError, updateAssets };
};
