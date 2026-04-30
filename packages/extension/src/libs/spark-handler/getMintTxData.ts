import { serializeMintContext } from './serializeMintContext';

interface IArgs {
  wasmModule: WasmModule | undefined;
  address: string;
  amount: string;
  utxos: {
    txHash: Buffer<ArrayBuffer>;
    vout: number;
    txHashLength: number;
  }[];
  memo?: string;
  isTestNetwork?: boolean;
}

export const getMintTxData = async ({
  wasmModule,
  address,
  amount,
  utxos,
  isTestNetwork = false,
  memo = '',
}: IArgs) => {
  if (!wasmModule) {
    console.error('Wasm not loaded');
    return;
  }

  let mintedCoinData = 0;
  let outputsPointerArray = 0;
  let serialContextPointer = 0;
  let recipientsVectorPtr = 0;

  const freeAll = () => {
    if (recipientsVectorPtr) {
      wasmModule.ccall(
        'js_freeRecipientVector',
        null,
        ['number'],
        [recipientsVectorPtr],
      );
    }
    if (serialContextPointer) wasmModule._free(serialContextPointer);
    if (outputsPointerArray) wasmModule._free(outputsPointerArray);
    if (mintedCoinData) {
      wasmModule.ccall(
        'js_freeCSparkMintMeta',
        null,
        ['number'],
        [mintedCoinData],
      );
    }
    if (decodedAddressPtr) {
      wasmModule.ccall('js_freeAddress', null, ['number'], [decodedAddressPtr]);
    }
  };

  const decodedAddressPtr = wasmModule.ccall(
    'js_decodeAddress',
    'number',
    ['string', 'number'],
    [address, Number(isTestNetwork)],
  );

  const outputsArray = [];

  try {
    mintedCoinData = wasmModule.ccall(
      'js_createMintedCoinData',
      'number',
      ['number', 'number', 'string'],
      [decodedAddressPtr, BigInt(amount), memo],
    );

    if (!mintedCoinData) {
      throw new Error(`Failed to create MintedCoinData`);
    }
    outputsArray.push(mintedCoinData);

    const pointerSize = 4;
    outputsPointerArray = wasmModule._malloc(pointerSize);

    outputsArray.forEach((outputPointer, index) => {
      wasmModule.HEAP32[(outputsPointerArray >> 2) + index] = outputPointer;
    });

    const { context: serialContext } = serializeMintContext(utxos);

    serialContextPointer = wasmModule._malloc(serialContext.length);
    wasmModule.HEAPU8.set(serialContext, serialContextPointer);

    recipientsVectorPtr = wasmModule._js_createSparkMintRecipients(
      outputsPointerArray,
      1,
      serialContextPointer,
      serialContext.length,
      1,
    );

    if (!recipientsVectorPtr) {
      throw new Error('Failed to call `js_createSparkMintRecipients`.');
    }

    const recipientsLength =
      wasmModule._js_getRecipientVectorLength(recipientsVectorPtr);

    const recipientsOutput = [];

    for (let i = 0; i < recipientsLength; i++) {
      const recipientPtr = wasmModule._js_getRecipientAt(recipientsVectorPtr, i);

      const scriptPubKeySize =
        wasmModule._js_getRecipientScriptPubKeySize(recipientPtr);
      const scriptPubKeyPointer =
        wasmModule._js_getRecipientScriptPubKey(recipientPtr);
      const scriptPubKey = new Uint8Array(scriptPubKeySize);
      for (let j = 0; j < scriptPubKeySize; j++) {
        scriptPubKey[j] = wasmModule.HEAPU8[scriptPubKeyPointer + j];
      }

      const amount = wasmModule._js_getRecipientAmount(recipientPtr);
      const subtractFeeFlag =
        wasmModule._js_getRecipientSubtractFeeFromAmountFlag(recipientPtr);

      recipientsOutput.push({
        scriptPubKey: Array.from(scriptPubKey)
          .map(b => b.toString(16).padStart(2, '0'))
          .join(''),
        amount,
        subtractFeeFlag,
      });
    }

    return recipientsOutput;
  } catch (e) {
    throw e;
  } finally {
    freeAll();
  }
};
