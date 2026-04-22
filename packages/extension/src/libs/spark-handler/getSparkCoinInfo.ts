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
  let serializedCoinPointer;
  let serialContextPointer;

  try {
    const serializedCoin = getSerializedCoin(
      coin[0],
    ) as unknown as ArrayLike<number>;
    serializedCoinPointer = wasmModule._malloc(serializedCoin.length);
    wasmModule.HEAPU8.set(serializedCoin, serializedCoinPointer);

    const serialContext = getSerializedCoin(
      coin[2],
    ) as unknown as ArrayLike<number>;
    serialContextPointer = wasmModule._malloc(serializedCoin.length);
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

    const coinFromMetaObj = wasmModule.ccall(
      'js_getCoinFromMeta',
      'number',
      ['number', 'number'],
      [metadataObj, incomingViewKeyObj],
    );
    if (!coinFromMetaObj) {
      throw new Error('Failed to get coin from metadata.');
    }

    inputDataObj = wasmModule.ccall(
      'js_getInputData',
      'number',
      ['number', 'number', 'number'],
      [deserializedCoinObj, fullViewKeyObj, incomingViewKeyObj],
    );
    if (!inputDataObj) {
      throw new Error('Failed to get input data.');
    }

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

    identifiedCoinObj = wasmModule.ccall(
      'js_identifyCoin',
      'number',
      ['number', 'number'],
      [deserializedCoinObj, incomingViewKeyObj],
    );
    if (!identifiedCoinObj) {
      throw new Error('Failed to identify coin.');
    }

    const value = wasmModule.ccall(
      'js_getIdentifiedCoinValue',
      'number',
      ['number'],
      [identifiedCoinObj],
    );

    const metaIsUsed = wasmModule.ccall(
      'js_getCSparkMintMetaIsUsed',
      'number',
      ['number'],
      [metadataObj],
    );

    return {
      value,
      isUsed: !!metaIsUsed,
      originalCoin: coin,
      metaData: metadataObj,
      tag: inputTagHex,
    };
  } catch (e) {
    throw e;
  } finally {
    if (serialContextPointer) wasmModule._free(serialContextPointer);
    if (serializedCoinPointer) wasmModule._free(serializedCoinPointer);
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
