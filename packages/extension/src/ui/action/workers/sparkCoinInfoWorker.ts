import { getSparkCoinInfo } from '@/libs/spark-handler/getSparkCoinInfo';
import { AnonymitySetModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';

interface Args {
  data: {
    allSets: AnonymitySetModel[];
    incomingViewKeyObj: number;
    fullViewKeyObj: number;
  };
}

addEventListener('message', async ({ data }: Args) => {
  try {
    const { allSets, fullViewKeyObj, incomingViewKeyObj } = data;
    // await init();
    // Import wasm module asynchronously
    // Load the WASM module using the loadWasm helper
    // TODO: Load wasm here

    allSets.forEach(set => {
      set.coins.forEach(coin => {
        getSparkCoinInfo({
          coin,
          fullViewKeyObj,
          incomingViewKeyObj,
        });
      });
    });

    postMessage('Done');
  } catch (error) {
    console.log(error);
    postMessage('error');
  }
});
