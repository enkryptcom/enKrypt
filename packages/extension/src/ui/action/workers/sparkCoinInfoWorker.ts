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

const db = new IndexedDBHelper();

export interface CheckedCoinData {
  coin: SparkCoinValue;
  setId: number;
  tag: string;
  setHash: string;
  indexInCoinList: number;
}

export interface OwnedCoinData {
  coin: string[];
  setId: number;
  isUsed: boolean;
  setHash: string;
  tag: string;
  value: bigint;
}

export const removeDuplicates = (
  coinsResult: Set<MyCoinModel>,
): Set<MyCoinModel> => {
  const arr = Array.from(coinsResult);
  const seen = new Set<string>();
  const deduped = [];

  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i];
    const key = `${item.tag}:${item.coin.join('|')}`;

    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  return new Set(deduped.reverse());
};

async function fetchAllCoinInfos(
  allSets: AnonymitySetModel[],
  lastSetId: number,
  lastCoinIndex: number,
  fullViewKeyObj: number,
  incomingViewKeyObj: number,
  Module: WasmModule,
) {
  try {
    const allPromises: Promise<any>[] = [];
    const finalResult: CheckedCoinData[] = [];

    const slicedSets = allSets.slice(lastSetId);

    slicedSets.forEach((set, index) => {
      for (const [coinIndex, coin] of set.coins.entries()) {
        if (coinIndex <= lastCoinIndex) continue

        const promise = getSparkCoinInfo({
          coin,
          fullViewKeyObj,
          incomingViewKeyObj,
          wasmModule: Module,
        }).then(res => {
          finalResult.push({
            coin: res,
            setId: lastSetId + index + 1,
            tag: res.tag,
            setHash: set.setHash,
            indexInCoinList: coinIndex,
          });
          return res;
        });

        allPromises.push(promise);
      }
    });

    await Promise.allSettled(allPromises);
    const myCoins = finalResult.map(coinData => ({
      coin: coinData.coin.originalCoin,
      setId: coinData.setId,
      value: coinData.coin.value,
      tag: coinData.tag,
      setHash: coinData.setHash,
      isUsed: false,
    }));

    const lastCoin = finalResult.at(-1)

    if (lastCoin) {
      const lastCointSetIdAndIndex = `${lastCoin?.setId}_${lastCoin?.indexInCoinList}`;
      await db.saveData(
        DB_DATA_KEYS.lastCointSetIdAndIndex,
        lastCointSetIdAndIndex,
      );
    }

    const savedMyCoins =
      (await db.readData<MyCoinModel[]>(DB_DATA_KEYS.myCoins)) || [];

    console.log('===>>>Saved My Coins:', savedMyCoins);
    console.log('===>>>My Calculated Spark Coins:', myCoins);

    const dedupedMyCoinsSet = removeDuplicates(
      new Set([...savedMyCoins, ...myCoins]),
    );

    console.log('===>>>Deduped Spark Coins:', dedupedMyCoinsSet);

    await db.saveData(DB_DATA_KEYS.myCoins, Array.from(dedupedMyCoinsSet));

    return Array.from(new Set([...savedMyCoins, ...myCoins]));
  } catch (err) {
    console.error(err);
  }
}

addEventListener('message', async () => {
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

  const lastCointSetIdAndIndex =
    (await db.readData<string>(DB_DATA_KEYS.lastCointSetIdAndIndex)) ?? '';

  const [lastCheckedSetIndex, lastCheckedCoinIndex] = lastCointSetIdAndIndex.split("_");
  console.log({ lastCheckedSetIndex, lastCheckedCoinIndex });

  const result = await fetchAllCoinInfos(
    allSets,
    Number(lastCheckedSetIndex || 0),
    Number(lastCheckedCoinIndex || 0),
    fullViewKeyObj,
    incomingViewKeyObj,
    Module,
  );

  Module.ccall(
    'js_freeIncomingViewKey',
    null,
    ['number'],
    [incomingViewKeyObj],
  );
  Module.ccall('js_freeFullViewKey', null, ['number'], [fullViewKeyObj]);

  postMessage(result);
});
