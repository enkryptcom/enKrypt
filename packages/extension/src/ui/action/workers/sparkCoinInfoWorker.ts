import {
  getSparkCoinInfo,
  SparkCoinValue,
} from '@/libs/spark-handler/getSparkCoinInfo.ts';
import { IndexedDBHelper } from '@action/db/indexedDB.ts';
import { wasmWorkerInstance } from '@/libs/utils/wasm-worker-loader.ts';
import {
  getIncomingViewKey,
  getSpendKeyObj,
} from '@/libs/spark-handler/generateSparkWallet.ts';
import { AnonymitySetModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';

const db = new IndexedDBHelper();

async function fetchAllCoinInfos(
  allSets: AnonymitySetModel[],
  fullViewKeyObj: number,
  incomingViewKeyObj: number,
  Module: WasmModule,
) {
  const allPromises: Promise<any>[] = [];
  const finalResult: SparkCoinValue[] = [];

  allSets.forEach(set => {
    set.coins.forEach(coin => {
      const promise = getSparkCoinInfo({
        coin,
        fullViewKeyObj,
        incomingViewKeyObj,
        wasmModule: Module,
      }).then(res => {
        console.log(res);
        finalResult.push(res);
        return res;
      });

      allPromises.push(promise);
    });
  });

  await Promise.allSettled(allPromises);

  return finalResult;
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

  const allSets = await db.readData();

  const result = await fetchAllCoinInfos(
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
