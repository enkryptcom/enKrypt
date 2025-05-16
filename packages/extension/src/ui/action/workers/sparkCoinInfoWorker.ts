import { getSparkCoinInfo } from '@/libs/spark-handler/getSparkCoinInfo.ts';
import { chunkedEvery } from '@/providers/bitcoin/libs/firo-wallet/utils.ts';
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
  const finalResult = [];

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
      });

      allPromises.push(promise);
    });
  });

  console.log('allPromises.length', allPromises.length);
  await Promise.all(allPromises);

  return finalResult;
}

addEventListener('message', async () => {
  const Module = await wasmWorkerInstance.getInstance();
  console.log('Module', 'Module');

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

  console.log('allSets.length', allSets.length);

  // const coinFetchDataResult: Record<string, any> = {};
  //
  // const promise = new Promise((resolve, reject) => {
  //   allSets.forEach(set => {
  //     set.coins.forEach(coin => {
  //       getSparkCoinInfo({
  //         coin: coin,
  //         fullViewKeyObj,
  //         incomingViewKeyObj,
  //         wasmModule: Module,
  //       }).then(result => {
  //         if (typeof result === 'string') {
  //           coinFetchDataResult[result]
  //             ? (coinFetchDataResult[result] = coinFetchDataResult[result] + 1)
  //             : (coinFetchDataResult[result] = 1);
  //         }
  //       });
  //     });
  //   });
  //
  //   resolve(coinFetchDataResult);
  // });

  // allSets.forEach(set => {
  //   chunkedEvery(
  //     set.coins,
  //     50,
  //     coin => {
  //       getSparkCoinInfo({
  //         coin: coin,
  //         fullViewKeyObj,
  //         incomingViewKeyObj,
  //         wasmModule: Module,
  //       }).then(result => {
  //         if (typeof result === 'string') {
  //           coinFetchDataResult[result]
  //             ? (coinFetchDataResult[result] = coinFetchDataResult[result] + 1)
  //             : (coinFetchDataResult[result] = 1);
  //         }
  //       });
  //     },
  //     () => {
  //       console.log('Finished', coinFetchDataResult);
  //     },
  //   );
  // });

  const result = await fetchAllCoinInfos(
    allSets,
    fullViewKeyObj,
    incomingViewKeyObj,
    Module,
  );
  console.log('All coins processed:', result);

  postMessage(result);

  // postMessage(coinFetchDataResult);
});
