import { getSerializedCoin } from './getSerializedCoin';

interface IArgs {
  coin: string[];
  incomingViewKeyObj: number;
  fullViewKeyObj: number;
  wasmModule: WasmModule;
  keepMemory?: boolean;
}

export interface SparkCoinValue {
  value: bigint;
  isUsed: boolean;
  originalCoin: string[];
  metaData: number;
  tag: string;
  deserializedCoinObj: number;
}

export const getSparkCoinInfo = async ({
  coin,
  fullViewKeyObj,
  incomingViewKeyObj,
  wasmModule,
  keepMemory = false,
}: IArgs): Promise<SparkCoinValue> => {
  let deserializedCoinObj;
  let inputDataObj;
  let inputDataWithMetaObj;
  let identifiedCoinObj;
  let metadataObj;
  try {
    const serializedCoin = getSerializedCoin(
      coin[0],
    ) as unknown as ArrayLike<number>;
    const serializedCoinPointer = wasmModule._malloc(serializedCoin.length);
    wasmModule.HEAPU8.set(serializedCoin, serializedCoinPointer);

    const serialContext = getSerializedCoin(
      coin[2],
    ) as unknown as ArrayLike<number>;
    const serialContextPointer = wasmModule._malloc(serializedCoin.length);
    wasmModule.HEAPU8.set(serialContext, serialContextPointer);

    deserializedCoinObj = wasmModule.ccall(
      'js_deserializeCoin',
      'number',
      ['number', 'number', 'number', 'number'],
      [
        serializedCoinPointer,
        serializedCoin.length,
        serialContextPointer,
        serialContext.length,
      ],
    );
    if (!deserializedCoinObj) {
      throw new Error('Failed to deserialize coin.');
    }

    metadataObj = wasmModule.ccall(
      'js_getMetadata',
      'number',
      ['number', 'number'],
      [deserializedCoinObj, incomingViewKeyObj],
    );

    if (!metadataObj) {
      throw new Error('FAILED_TO_GET_METADATA');
    }
    console.log('Coin Metadata:', metadataObj);

    const coinFromMetaObj = wasmModule.ccall(
      'js_getCoinFromMeta',
      'number',
      ['number', 'number'],
      [metadataObj, incomingViewKeyObj],
    );
    if (!coinFromMetaObj) {
      throw new Error('Failed to get coin from metadata.');
    }
    console.log('Coin from Metadata:', coinFromMetaObj);

    inputDataObj = wasmModule.ccall(
      'js_getInputData',
      'number',
      ['number', 'number', 'number'],
      [deserializedCoinObj, fullViewKeyObj, incomingViewKeyObj],
    );
    if (!inputDataObj) {
      throw new Error('Failed to get input data.');
    }
    console.log('Input Data:', inputDataObj);

    const inputTagHex = wasmModule.ccall(
      'js_getInputCoinDataTag_base64',
      'string',
      ['number'],
      [inputDataObj],
    );

    inputDataWithMetaObj = wasmModule.ccall(
      'js_getInputDataWithMeta',
      'number',
      ['number', 'number', 'number'],
      [deserializedCoinObj, metadataObj, fullViewKeyObj],
    );
    if (!inputDataWithMetaObj) {
      throw new Error('Failed to get input data with metadata.');
    }
    console.log('Input Data with Metadata:', inputDataWithMetaObj);

    identifiedCoinObj = wasmModule.ccall(
      'js_identifyCoin',
      'number',
      ['number', 'number'],
      [deserializedCoinObj, incomingViewKeyObj],
    );
    if (!identifiedCoinObj) {
      throw new Error('Failed to identify coin.');
    }
    console.log('Identified Coin:', identifiedCoinObj);

    // Example usage of `js_getIdentifiedCoinDiversifier`
    const diversifier = wasmModule.ccall(
      'js_getIdentifiedCoinDiversifier',
      'number',
      ['number'],
      [identifiedCoinObj],
    );
    console.log('Identified Coin Diversifier:', diversifier);

    const value = wasmModule.ccall(
      'js_getIdentifiedCoinValue',
      'number',
      ['number'],
      [identifiedCoinObj],
    );
    console.log('Identified Coin Value:', value);

    // Example usage of `js_getIdentifiedCoinMemo`
    // const memo = wasmModule.UTF8ToString(
    //   wasmModule.ccall(
    //     'js_getIdentifiedCoinMemo',
    //     'number',
    //     ['number'],
    //     [identifiedCoinObj],
    //   ),
    // );
    // console.log('Identified Coin Memo:', memo);

    // Example usage of `js_getCSparkMintMetaHeight`
    // const metaHeight = wasmModule.ccall(
    //   'js_getCSparkMintMetaHeight',
    //   'number',
    //   ['number'],
    //   [metadataObj],
    // );
    // console.log('Spark Mint Meta Height:', metaHeight);

    // // Example usage of `js_getCSparkMintMetaId`
    // const metaId = wasmModule.ccall(
    //   'js_getCSparkMintMetaId',
    //   'number',
    //   ['number'],
    //   [metadataObj],
    // );
    // console.log('Spark Mint Meta ID:', metaId);

    const metaIsUsed = wasmModule.ccall(
      'js_getCSparkMintMetaIsUsed',
      'number',
      ['number'],
      [metadataObj],
    );
    console.log('Spark Mint Meta Is Used:', metaIsUsed !== 0);

    // Example usage of `js_getCSparkMintMetaMemo`
    // const metaMemo = wasmModule.UTF8ToString(
    //   wasmModule.ccall(
    //     'js_getCSparkMintMetaMemo',
    //     'number',
    //     ['number'],
    //     [metadataObj],
    //   ),
    // );
    // console.log('Spark Mint Meta Memo:', metaMemo);

    // Example usage of `js_getCSparkMintMetaDiversifier`
    // const metaDiversifier = wasmModule.ccall(
    //   'js_getCSparkMintMetaDiversifier',
    //   'number',
    //   ['number'],
    //   [metadataObj],
    // );
    // console.log('Spark Mint Meta Diversifier:', metaDiversifier);

    // Example usage of `js_getCSparkMintMetaValue`
    // const metaValue = wasmModule.ccall(
    //   'js_getCSparkMintMetaValue',
    //   'number',
    //   ['number'],
    //   [metadataObj],
    // );
    // console.log('Spark Mint Meta Value:', metaValue);

    // Example usage of `js_getCSparkMintMetaType`
    // const metaType = wasmModule.ccall(
    //   'js_getCSparkMintMetaType',
    //   'number',
    //   ['number'],
    //   [metadataObj],
    // );
    // console.log('Spark Mint Meta Type:', metaType);
    //
    // // Example usage of `js_getCSparkMintMetaCoin`
    // const metaCoinObj = wasmModule.ccall(
    //   'js_getCSparkMintMetaCoin',
    //   'number',
    //   ['number'],
    //   [metadataObj],
    // );
    // console.log('Spark Mint Meta Coin:', metaCoinObj);
    //
    // // Example usage of `js_getInputCoinDataCoverSetId`
    // const inputCoverSetId = wasmModule.ccall(
    //   'js_getInputCoinDataCoverSetId',
    //   'number',
    //   ['number'],
    //   [inputDataObj],
    // );
    // console.log('Input Coin Data Cover Set ID:', inputCoverSetId);
    //
    // // Example usage of `js_getInputCoinDataIndex`
    // const inputIndex = wasmModule.ccall(
    //   'js_getInputCoinDataIndex',
    //   'number',
    //   ['number'],
    //   [inputDataObj],
    // );
    // console.log('Input Coin Data Index:', inputIndex);
    //
    // // Example usage of `js_getInputCoinDataValue`
    // const inputValue = wasmModule.ccall(
    //   'js_getInputCoinDataValue',
    //   'number',
    //   ['number'],
    //   [inputDataObj],
    // );
    // console.log('Input Coin Data Value:', inputValue);

    // const savedOwnCoins = await db.readData('ownCoins');
    // await db.saveData('', [
    //   ...savedOwnCoins,
    //   {
    //     diversifier,
    //     value,
    //     memo,
    //     metaHeight,
    //     metaId,
    //   },
    // ]);

    return {
      value,
      isUsed: !!metaIsUsed,
      originalCoin: coin,
      metaData: metadataObj,
      tag: inputTagHex,
      deserializedCoinObj,
    };
  } catch (e) {
    throw e;
  } finally {
    if (!keepMemory) {
      wasmModule.ccall('js_freeCoin', null, ['number'], [deserializedCoinObj]);
      wasmModule.ccall(
        'js_freeInputCoinData',
        null,
        ['number'],
        [inputDataObj],
      );
      wasmModule.ccall(
        'js_freeInputCoinData',
        null,
        ['number'],
        [inputDataWithMetaObj],
      );
      wasmModule.ccall(
        'js_freeIdentifiedCoinData',
        null,
        ['number'],
        [identifiedCoinObj],
      );
      wasmModule.ccall(
        'js_freeCSparkMintMeta',
        null,
        ['number'],
        [metadataObj],
      );
    }
  }
};
