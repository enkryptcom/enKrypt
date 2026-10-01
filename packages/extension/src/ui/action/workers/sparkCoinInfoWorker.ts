import {
  getSparkCoinInfo,
  SparkCoinValue,
} from '@/libs/spark-handler/getSparkCoinInfo';
import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import { wasmWorkerInstance } from '@/libs/utils/wasm-worker-loader';
import {
  getIncomingViewKey,
  getSpendKeyObj,
} from '@/libs/spark-handler/generateSparkWallet';
import {
  AnonymitySetModel,
  MyCoinModel,
} from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { getSetsFromDb } from '@/libs/utils/updateAndSync/getSetsFromDb';
import { removeDuplicates } from '@/libs/spark-handler/owned-coins';

const db = new IndexedDBHelper();

export interface CheckedCoinData {
  coin: SparkCoinValue;
  setId: number;
  tag: string;
  setHash: string;
  isUsed: boolean;
}

async function fetchAllCoinInfos(
  allSets: AnonymitySetModel[],
  lastSetId: number,
  fullViewKeyObj: number,
  incomingViewKeyObj: number,
  Module: WasmModule,
) {
  try {
    const allPromises: Promise<any>[] = [];
    const finalResult: CheckedCoinData[] = [];

    const slicedSets = allSets.slice(lastSetId);

    console.log({ slicedSets, lastSetId, allSets });

    slicedSets.forEach((set, index) => {
      set.coins.forEach(coin => {
        const promise = getSparkCoinInfo({
          coin,
          fullViewKeyObj,
          incomingViewKeyObj,
          wasmModule: Module,
        }).then(async res => {
          finalResult.push({
            coin: res,
            setId: lastSetId + index + 1,
            tag: res.tag,
            setHash: set.setHash,
            isUsed: res.isUsed,
          });
          return res;
        });

        allPromises.push(promise);
      });
    });

    await Promise.allSettled(allPromises);
    const myCoins = finalResult
      .sort((a, b) => a.setId - b.setId)
      .map(coinData => ({
        coin: coinData.coin.originalCoin,
        setId: coinData.setId,
        value: coinData.coin.value,
        tag: coinData.tag,
        setHash: coinData.setHash,
        isUsed: coinData.isUsed,
      }));

    const savedMyCoins =
      (await db.readData<MyCoinModel[]>(DB_DATA_KEYS.myCoins)) || [];

    const dedupedMyCoinsSet = removeDuplicates(
      new Set([...savedMyCoins, ...myCoins]),
    );

    console.log('===>>>Deduped Spark Coins:', dedupedMyCoinsSet);

    await db.saveData(DB_DATA_KEYS.myCoins, Array.from(dedupedMyCoinsSet));

    return Array.from(new Set([...savedMyCoins, ...myCoins]));
  } catch (err) {
    console.error(err);
    return [];
  }
}

addEventListener('message', async () => {
  try {
    await synchronizeCoins();
  } catch (error) {
    console.error('sparkCoinInfoWorker failed:', error);
    postMessage({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

async function synchronizeCoins() {
  const Module = await wasmWorkerInstance.getInstance();

  const spendKeyObj = await getSpendKeyObj(Module);

  if (!spendKeyObj || spendKeyObj === 0) {
    throw new Error('Failed to create spendKeyObj');
  }

  const incomingViewKey = await getIncomingViewKey(Module, spendKeyObj);

  if (!incomingViewKey) {
    throw new Error('Failed to create IncomingViewKey');
  }

  const { incomingViewKeyObj, fullViewKeyObj } = incomingViewKey;

  if (!incomingViewKeyObj || incomingViewKeyObj === 0 || fullViewKeyObj === 0) {
    throw new Error('Failed to create IncomingViewKey and fullViewKeyObj');
  }

  const allSets = await getSetsFromDb();

  const lastCheckedSetIndex =
    (await db.readData<string>(DB_DATA_KEYS.lastCheckedSetIndex)) ?? 0;

  const result = await fetchAllCoinInfos(
    allSets,
    Number(lastCheckedSetIndex || 0),
    fullViewKeyObj,
    incomingViewKeyObj,
    Module,
  );

  await db.saveData(DB_DATA_KEYS.lastCheckedSetIndex, allSets.length - 1);

  Module.ccall(
    'js_freeIncomingViewKey',
    null,
    ['number'],
    [incomingViewKeyObj],
  );
  Module.ccall('js_freeFullViewKey', null, ['number'], [fullViewKeyObj]);

  postMessage(result);
}
