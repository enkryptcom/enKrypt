import { ref, watch, Ref } from 'vue';
import { NetworkNames } from '@enkryptcom/types/dist';
import { BaseNetwork } from '@/types/base-network';
import { AccountsHeaderData } from '@action/types/account';
import { SyncedSparkCoin } from '@/libs/utils/updateAndSync/markCoinsAsUsed';
import { rebuildSparkHistory } from '@/libs/utils/updateAndSync/rebuildSparkHistory';

export const useUpdateActivityState = (
  networkRef: Ref<BaseNetwork>,
  sparkUnusedTxDetails: Ref<SyncedSparkCoin[]>,
  accountHeaderData: Ref<AccountsHeaderData>,
) => {
  // Bumped after each sync so an open activity page shows the new rows
  // (see useMergeSparkHistory).
  const sparkHistoryVersion = ref(0);

  watch(
    [sparkUnusedTxDetails, networkRef],
    async ([coins]) => {
      const network = networkRef.value;
      const selectedAccount = accountHeaderData.value.selectedAccount;

      if (
        network.name !== NetworkNames.Firo ||
        !selectedAccount ||
        !coins.length
      ) {
        return;
      }

      // Private history belongs to the whole wallet and is rebuilt from its
      // coins, so it comes back after the extension is reinstalled.
      await rebuildSparkHistory({
        coins,
        network,
        sparkAddress: accountHeaderData.value.sparkAccount?.defaultAddress,
      });

      sparkHistoryVersion.value++;
    },
    { deep: true },
  );

  return { sparkHistoryVersion };
};
