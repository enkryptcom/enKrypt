import { getSparkCoinInfo } from '@/libs/spark-handler/getSparkCoinInfo';
import { AnonymitySetModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';

interface Args {
  data: {
    allSets: AnonymitySetModel[];
    incomingViewKeyObj: number;
    fullViewKeyObj: number;
  };
}

console.log('worker called');

addEventListener('message', async ({ data }: Args) => {
  console.log('listener called');
  postMessage('worker loaded');
  try {
    const { allSets, fullViewKeyObj, incomingViewKeyObj } = data;
    // await init();
    // Import wasm module asynchronously
    // Load the WASM module using the loadWasm helper
    // TODO: Load wasm here

    // const wasm = wasmInstance.getInstance();

    // if (!Module) {
    //   postMessage('Wasm module not loaded');
    // } else {
    //   postMessage('Wasm module loaded');
    // }

    //
    // allSets.forEach(set => {
    //   set.coins.forEach(coin => {
    //     getSparkCoinInfo({
    //       coin,
    //       fullViewKeyObj,
    //       incomingViewKeyObj,
    //     });
    //     console.log('Coin:', coin);
    //   });
    // });

    postMessage('Done');
  } catch (error) {
    console.log(error);
    postMessage('error');
  }
});
