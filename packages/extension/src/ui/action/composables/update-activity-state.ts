import { watch, Ref } from 'vue';
import { NetworkNames } from '@enkryptcom/types/dist';
import { BaseNetwork } from '@/types/base-network';
import { ActivityStatus, ActivityType } from '@/types/activity';
import ActivityState from '@/libs/activity-state';
import { AccountsHeaderData } from '@action/types/account';
import { SparkUnusedTxDetails } from '@/libs/utils/updateAndSync/markCoinsAsUsed';

const activityState = new ActivityState();

export const useUpdateActivityState = (
  networkRef: Ref<BaseNetwork>,
  sparkUnusedTxDetails: Ref<SparkUnusedTxDetails[]>,
  accountHeaderData: Ref<AccountsHeaderData>,
) => {
  watch(
    [sparkUnusedTxDetails, networkRef],
    () => {
      const network = networkRef.value;
      const selectedAccount = accountHeaderData.value.selectedAccount;
      const details = sparkUnusedTxDetails.value;

      if (
        network.name !== NetworkNames.Firo ||
        !selectedAccount ||
        !details.length
      ) {
        return;
      }
      console.log('Watching sparkUnusedTxDetails change', details);

      sparkUnusedTxDetails.value.forEach(txDetail => {
        if (!txDetail || !txDetail.vin.length || !txDetail.vout.length) {
          return;
        }
        activityState.addActivities(
          [
            {
              network: network.name,
              from: 'Hidden',
              to: 'Hidden',
              isIncoming: false,
              status: ActivityStatus.success,
              timestamp: txDetail.time * 1000,
              type: ActivityType.spark_transaction,
              value: (txDetail.value / network.decimals).toString(),
              transactionHash: txDetail.txid,
              token: {
                icon: network.icon,
                symbol: network.currencyName,
                name: network.currencyName,
                decimals: network.decimals,
              },
            },
          ],
          {
            address: network.displayAddress(selectedAccount.address),
            network: network.name,
          },
        );
      });
    },
    { deep: true },
  );
};
