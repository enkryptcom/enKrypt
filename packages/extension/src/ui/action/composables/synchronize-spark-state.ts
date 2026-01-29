import { ref, onMounted, watch, Ref } from 'vue';
import { NetworkNames } from '@enkryptcom/types/dist';
import { startCoinSetSync } from '@/libs/utils/updateAndSync/updateCoinSet';
import { startTagSetSync } from '@/libs/utils/updateAndSync/updateTagsSet';
import BigNumber from 'bignumber.js';
import { BaseNetwork } from '@/types/base-network';
import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import { intersectSets } from '@action/utils/set-utils';
import { MyCoinModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { base64ToReversedHex } from '@/libs/spark-handler/utils';

export interface FiroExplorerTxResponse {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    sequence: number;
    n: number;
    addr?: string;
    addresses?: string[];
    value?: number;
    valueSat?: number;
  }>;
  vout: Array<{
    value: string;
    n: number;
    scriptPubKey: {
      hex: string;
      asm: string;
      addresses?: string[] | null;
      type: string;
    };
    spentTxId?: string | null;
    spentIndex?: number | null;
    spentHeight?: number | null;
  }>;
  blockhash: string;
  blockheight: number;
  confirmations: number;
  time: number;
  blocktime: number;
  valueOut: number;
  size: number;
  valueIn: number;
  fees: number;
  extraPayload?: boolean;
}

const fetchFiroTxByTxId = async (
  baseUrl: string,
  txId: string,
): Promise<FiroExplorerTxResponse | null> => {
  const url = `${baseUrl.replace(/\/$/, '')}/insight-api-zcoin/tx/${txId}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.message) return null;
  return data as FiroExplorerTxResponse;
};

export const useSynchronizeSparkState = (
  networkRef: Ref<BaseNetwork>,
  onBalanceCalculated?: (balance: string) => void,
) => {
  const db = new IndexedDBHelper();

  const isPending = ref(false);
  const error = ref(null);

  const coinFetchDone = ref(false);
  const tagFetchDone = ref(false);

  const sparkUnusedTxDetails = ref<FiroExplorerTxResponse[]>([]);

  const markCoinsAsUsed = async () => {
    const usedCoinsTags = await db.readData<{ tags: [string, string] }>(
      DB_DATA_KEYS.usedCoinsTags,
    );

    const coinsTagsSet = new Set(usedCoinsTags?.tags ?? []);
    const myCoins = await db.readData<MyCoinModel[]>(DB_DATA_KEYS.myCoins);
    const myCoinsTagsSet = new Set((myCoins ?? []).map(coin => coin.tag));

    const usedMyCoinsTagsSet = intersectSets(coinsTagsSet, myCoinsTagsSet);

    await Promise.all(
      Array.from(usedMyCoinsTagsSet).map(tag => db.markCoinsAsUsed(tag)),
    );

    coinFetchDone.value = false;
    tagFetchDone.value = false;

    const myCoinsIsUsedApplied = await db.readData<MyCoinModel[]>(
      DB_DATA_KEYS.myCoins,
    );

    const balance = myCoinsIsUsedApplied
      .filter(el => !el.isUsed)
      .reduce((a: bigint, c) => a + c.value, 0n);

    const mintIds = myCoinsIsUsedApplied
      .filter(coin => !coin.isUsed)
      .map(unusedCoin => unusedCoin.coin[1]);

    const txIdsDecoded = mintIds
      .map(base64 => {
        try {
          return base64ToReversedHex(base64);
        } catch {
          return '';
        }
      })
      .filter(Boolean);

    console.log('===>>>Unused Spark Coins TX IDs:', txIdsDecoded);

    const node = networkRef.value?.node;
    if (node && txIdsDecoded.length > 0) {
      const results = await Promise.allSettled(
        txIdsDecoded.map(txId => fetchFiroTxByTxId(node, txId)),
      );
      const details = results
        .filter(
          (r): r is PromiseFulfilledResult<FiroExplorerTxResponse | null> =>
            r.status === 'fulfilled',
        )
        .map(r => r.value)
        .filter((v): v is FiroExplorerTxResponse => v != null);
      sparkUnusedTxDetails.value = details;
    } else {
      sparkUnusedTxDetails.value = [];
    }

    console.log('===>>>Spark Unused TX Details:', sparkUnusedTxDetails.value);

    const sparkBalance = new BigNumber(balance.toString()).toString();

    if (onBalanceCalculated) {
      try {
        onBalanceCalculated(sparkBalance);
      } catch (err) {
        console.error('Error in onBalanceCalculated callback:', err);
      }
    }
    await db.saveData('sparkBalance', sparkBalance);
  };

  const synchronizeWorker = () => {
    const worker = new Worker(
      new URL('../workers/sparkCoinInfoWorker.ts', import.meta.url),
      { type: 'module' },
    );

    console.log('%c[synchronizeWorker] Worker initialized', 'color: green');

    worker.postMessage('');

    worker.onmessage = () => {
      coinFetchDone.value = true;
    };
  };

  const synchronize = async () => {
    try {
      const networkName = networkRef.value.name;
      if (networkName !== NetworkNames.Firo) return;

      isPending.value = true;

      startCoinSetSync({
        onComplete: () => {
          synchronizeWorker();
        },
      });

      startTagSetSync({
        onComplete: () => {
          tagFetchDone.value = true;
        },
      });
    } catch (err: any) {
      error.value = err;
      console.error('Syncing error:', err);
    } finally {
      isPending.value = false;
    }
  };

  watch(() => networkRef.value.name, synchronize, { immediate: true });

  watch(
    () => [coinFetchDone.value, tagFetchDone.value],
    ([updatedCoinFetchDone, updatedTagFetchDone]) => {
      if (updatedCoinFetchDone && updatedTagFetchDone) {
        void markCoinsAsUsed();
      }
    },
  );

  onMounted(() => {
    void synchronize();
  });

  return {
    synchronize,
    isPending,
    error,
    sparkUnusedTxDetails,
  };
};
