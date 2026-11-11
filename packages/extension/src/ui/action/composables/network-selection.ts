import { useRouter } from 'vue-router';
import BackupState from '@/libs/backup-state';
import { BaseNetwork } from '@/types/base-network';
import { useNetworksStore } from '@action/store/networks-store';

/**
 * Wraps the networks store's init, setCurrentNetwork and setCurrentSubNetwork.
 * Each wrapper runs the store action and then opens the assets view of the
 * current network. The stores never call the router, so navigation happens here.
 */
export default () => {
  const router = useRouter();
  const networksStore = useNetworksStore();
  const backupState = new BackupState();

  const showAssets = () =>
    router.push({
      name: 'assets',
      params: { id: networksStore.currentNetwork.name },
    });

  /**
   * Loads the saved network and its accounts and opens its assets. Run it when
   * the popup opens or is unlocked, and again whenever accounts are added,
   * renamed, deleted or imported, so the account list and the backup stay current.
   */
  const init = async () => {
    await networksStore.init();
    backupState.backup(true).catch(console.error);
    await showAssets();
  };

  const selectNetwork = async (network: BaseNetwork) => {
    await networksStore.setCurrentNetwork(network);
    await showAssets();
  };

  const selectSubNetwork = async (id: string) => {
    await networksStore.setCurrentSubNetwork(id);
    await showAssets();
  };

  return { init, selectNetwork, selectSubNetwork };
};
