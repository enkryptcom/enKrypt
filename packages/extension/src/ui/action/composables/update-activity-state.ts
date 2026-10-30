import { watch, Ref } from 'vue';
import { NetworkNames } from '@enkryptcom/types/dist';
import { BaseNetwork } from '@/types/base-network';
import { ActivityStatus, ActivityType } from '@/types/activity';
import ActivityState from '@/libs/activity-state';
import { AccountsHeaderData } from '@action/types/account';
import { SparkUnusedTxDetails } from '@/libs/utils/updateAndSync/markCoinsAsUsed';
import { fromBase } from '@enkryptcom/utils';
import { getSparkHistoryOptions } from '@/libs/utils/spark-history';

const activityState = new ActivityState();

export const useUpdateActivityState = (
  networkRef: Ref<BaseNetwork>,
  sparkUnusedTxDetails: Ref<SparkUnusedTxDetails[]>,
  accountHeaderData: Ref<AccountsHeaderData>,
) => {
  watch(
    [sparkUnusedTxDetails, networkRef],
    async ([details]) => {
      const network = networkRef.value;
      const selectedAccount = accountHeaderData.value.selectedAccount;

      if (
        network.name !== NetworkNames.Firo ||
        !selectedAccount ||
        !details.length
      ) {
        return;
      }
      console.log('Watching sparkUnusedTxDetails change', details);

      for (const txDetail of details) {
        // Skip just this entry; stopping here would drop all the ones after it.
        if (!txDetail || !txDetail.vin?.length || !txDetail.vout?.length) {
          continue;
        }

        await activityState.addActivities(
          [
            {
              network: network.name,
              from:
                accountHeaderData.value.sparkAccount?.defaultAddress ??
                'Hidden',
              to: 'Hidden',
              isIncoming: false,
              status: ActivityStatus.success,
              timestamp: txDetail.time * 1000,
              type: ActivityType.spark_transaction,
              value: fromBase(`${txDetail.value}`, network.decimals).toString(),
              transactionHash: txDetail.txid,
              token: {
                icon: network.icon,
                symbol: network.currencyName,
                name: network.currencyName,
                decimals: network.decimals,
              },
            },
          ],
          // Private history belongs to the whole wallet, not to whichever
          // account happens to be selected when the sync finishes.
          getSparkHistoryOptions(network.name),
        );
      }
    },
    { deep: true },
  );
};
