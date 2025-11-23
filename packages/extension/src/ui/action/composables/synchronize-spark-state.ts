import { ref, onMounted, watch, Ref } from 'vue';
import { NetworkNames } from '@enkryptcom/types/dist';
import { startCoinSetSync } from '@/libs/utils/updateAndSync/updateCoinSet';
import { startTagSetSync } from '@/libs/utils/updateAndSync/updateTagsSet';
import BigNumber from 'bignumber.js';
import { BaseNetwork } from '@/types/base-network';

export const useSynchronizeSparkState = (
  networkRef: Ref<BaseNetwork>,
  onBalanceCalculated?: (balance: string) => void,
) => {
  const isPending = ref(false);
  const error = ref(null);

  const synchronizeWorker = () => {
    const worker = new Worker(
      new URL('../workers/sparkCoinInfoWorker.ts', import.meta.url),
      { type: 'module' },
    );

    console.log('%c[synchronizeWorker] Worker initialized', 'color: green');

    worker.postMessage('');

    worker.onmessage = ({ data }) => {
      console.log(
        '%c[synchronizeWorker] Worker onmessage data:',
        'color: green',
        data,
      );

      const balance = data.reduce((a: bigint, c: any) => {
        if (typeof c.coin.value !== 'bigint') return a;
        return a + c.coin.value;
      }, 0n);

      const sparkBalance = new BigNumber(balance).toString();
      console.log({ sparkBalance });

      if (onBalanceCalculated) {
        try {
          onBalanceCalculated(sparkBalance);
        } catch (err) {
          console.error('Error in onBalanceCalculated callback:', err);
        }
      }
      // db.saveData('sparkBalance', sparkBalance);
      // updateSparkBalance(currentNetwork.value).then(async () => {
      //   await db.saveData('setLoadingStatus', 'idle');
      //   isSyncing.value = false;
      // });
    };
  };

  const synchronize = async () => {
    try {
      const networkName = networkRef.value.name;
      if (networkName !== NetworkNames.Firo) return;

      isPending.value = true;

      startCoinSetSync({
        onComplete: () => {
          console.log('%cCoin set sync completed', 'color: red', networkName);
          synchronizeWorker();
        },
      });

      startTagSetSync();
    } catch (err: any) {
      error.value = err;
      console.error('Syncing error:', err);
    } finally {
      isPending.value = false;
    }
  };

  watch(() => networkRef.value.name, synchronize, { immediate: true });

  onMounted(() => {
    synchronize();
  });

  return {
    synchronize,
    isPending,
    error,
  };
};