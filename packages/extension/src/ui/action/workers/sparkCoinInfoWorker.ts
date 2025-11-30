import {
  getSparkCoinInfo,
  SparkCoinValue,
} from '@/libs/spark-handler/getSparkCoinInfo.ts';
import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB.ts';
import { wasmWorkerInstance } from '@/libs/utils/wasm-worker-loader.ts';
import {
  getIncomingViewKey,
  getSpendKeyObj,
} from '@/libs/spark-handler/generateSparkWallet.ts';
import {
  AnonymitySetModel,
  MyCoinModel,
} from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { differenceSets } from '@action/utils/set-utils.ts';

const db = new IndexedDBHelper();

export interface CheckedCoinData {
  coin: SparkCoinValue;
  setId: number;
  tag: string;
  setHash: string;
}

export interface OwnedCoinData {
  coin: string[];
  setId: number;
  isUsed: boolean;
  setHash: string;
  tag: string;
  value: bigint;
}

const removeDuplicates = (coinsResult: Set<MyCoinModel>): Set<MyCoinModel> => {
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
  firstCoinSetId: number,
  myCoinsMap: Map<string, MyCoinModel>,
  allSets: AnonymitySetModel[],
  fullViewKeyObj: number,
  incomingViewKeyObj: number,
  Module: WasmModule,
) {
  try {
    const allPromises: Promise<any>[] = [];
    const finalResult: CheckedCoinData[] = [];

    allSets.slice(firstCoinSetId).forEach((set, index) => {
      set.coins.forEach(coin => {
        const setCoin = `${coin.join()}${set.setHash}`;

        if (!myCoinsMap.has(setCoin)) {
          const promise = getSparkCoinInfo({
            coin,
            fullViewKeyObj,
            incomingViewKeyObj,
            wasmModule: Module,
          }).then(async res => {
            console.log(`Checking coin: `, res);
            finalResult.push({
              coin: res,
              setId: index + 1,
              tag: res.tag,
              setHash: set.setHash,
            });
            // TODO: initially DB_DATA_KEYS.myCoins is undefined in loop , better to append one by one
            // const oldCoins = await db.readData<MyCoinModel[]>(
            //   DB_DATA_KEYS.myCoins,
            // );
            // console.log({ oldCoins });
            // await db.saveData(DB_DATA_KEYS.myCoins, [
            //   ...(oldCoins ?? []),
            //   {
            //     coin: res.originalCoin,
            //     setId: index + 1,
            //     setHash: set.setHash,
            //     value: res.value,
            //     tag: res.tag,
            //     isUsed: false,
            //   },
            // ]);
            return res;
          });

          allPromises.push(promise);
        }
      });
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

    console.log(
      JSON.stringify(
        myCoins.map(el => ({ ...el, value: el.value.toString() })),
      ),
    );

    const savedMyCoins = (await db.readData<any[]>(DB_DATA_KEYS.myCoins)) || [];
    const updatedMyCoinsSet = differenceSets(
      new Set(savedMyCoins),
      new Set(myCoins),
    );
    const dedupedMyCoinsSet = removeDuplicates(updatedMyCoinsSet);
    await db.saveData(DB_DATA_KEYS.myCoins, Array.from(dedupedMyCoinsSet));

    return Array.from(updatedMyCoinsSet);
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

  const allSets = await db.readData<AnonymitySetModel[]>(DB_DATA_KEYS.sets);
  const myCoins = await db.readData<MyCoinModel[]>(DB_DATA_KEYS.myCoins);

  const myCoinsMap = new Map<string, MyCoinModel>();
  (myCoins ?? []).forEach(coin => {
    myCoinsMap.set(`${coin.coin.join()}${coin.setHash}`, coin);
  });

  const lastCoinSetId = (myCoins ?? []).at(-1)?.setId ?? 0;

  const firstCoinSetId = lastCoinSetId - 1 < 1 ? 0 : lastCoinSetId - 1;

  const result = await fetchAllCoinInfos(
    firstCoinSetId,
    myCoinsMap,
    allSets,
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
