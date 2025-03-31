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
    console.log('Wasm not loaded');
    return;
  }

  const decodedAddressPtr = wasmModule.ccall(
    'js_decodeAddress',
    'number',
    ['string', 'number'],
    [address, Number(isTestNetwork)],
  );

  const outputsArray = [];

  const mintedCoinData = wasmModule._js_createMintedCoinData(
    decodedAddressPtr,
    BigInt(amount),
    memo,
  );

  if (!mintedCoinData) {
    throw new Error(`Failed to create MintedCoinData`);
  }
  outputsArray.push(mintedCoinData);

  const pointerSize = 4;
  const outputsPointerArray = wasmModule._malloc(pointerSize);

  outputsArray.forEach((outputPointer, index) => {
    wasmModule.HEAP32[(outputsPointerArray >> 2) + index] = outputPointer;
  });

  const { context: serialContext } = serializeMintContext(utxos);

  const serialContextPointer = wasmModule._malloc(serialContext.length);
  wasmModule.HEAPU8.set(serialContext, serialContextPointer);

  const recipientsVectorPtr = wasmModule._js_createSparkMintRecipients(
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

  console.log({ recipientsOutput });

  wasmModule._free(outputsPointerArray);
  wasmModule._free(serialContextPointer);

  return recipientsOutput;
};
