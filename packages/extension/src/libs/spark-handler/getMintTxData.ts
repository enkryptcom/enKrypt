import { loadWasm } from "../utils/wasm-loader";

export const getMintTxData = async (address: string, amount: number, memo = "", isTestNetwork = false) => {
    const wasmModule = await loadWasm()
    
    if (!wasmModule) {
        console.log("Wasm not loaded");
        return;
    }

    const decodedAddressPtr = wasmModule.ccall(
        "js_decodeAddress",
        "number",
        ["string", "number"],
        [address, !!isTestNetwork]
    );


    const outputsLength = 1; // Example: 2 outputs
    const outputsArray = [];


    const mintedCoinData = wasmModule.ccall(
        "js_createMintedCoinData",
        "number",
        ["string", "number", "string"],
        [decodedAddressPtr, amount, memo]
    )

    if (!mintedCoinData) {
        throw new Error(`Failed to create MintedCoinData`);
    }
    outputsArray.push(mintedCoinData);

    const pointerSize = 4; 
    const outputsPointerArray = wasmModule._malloc(pointerSize);

    outputsArray.forEach((outputPointer, index) => {
        wasmModule.HEAP32[(outputsPointerArray >> 2) + index] = outputPointer;
    });

    const serialContext = new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9A, 0xBC]);
    const serialContextPointer = wasmModule._malloc(serialContext.length);
    wasmModule.HEAPU8.set(serialContext, serialContextPointer);

    const recipientsVectorPtr = wasmModule._js_createSparkMintRecipients(
        outputsPointerArray,
        outputsLength,
        serialContextPointer,
        serialContext.length,
        1
    );

    if (!recipientsVectorPtr) {
        throw new Error('Failed to call `js_createSparkMintRecipients`.');
    }

    const recipientsLength = wasmModule._js_getRecipientVectorLength(recipientsVectorPtr);
    console.log(`Number of Recipients: ${recipientsLength}`);

    const recipientsOutput = []

    for (let i = 0; i < recipientsLength; i++) {
        const recipientPtr = wasmModule._js_getRecipientAt(recipientsVectorPtr, i);

        const scriptPubKeySize = wasmModule._js_getRecipientScriptPubKeySize(recipientPtr);
        const scriptPubKeyPointer = wasmModule._js_getRecipientScriptPubKey(recipientPtr);
        const scriptPubKey = new Uint8Array(scriptPubKeySize);
        for (let j = 0; j < scriptPubKeySize; j++) {
            scriptPubKey[j] = wasmModule.HEAPU8[scriptPubKeyPointer + j];
        }

        const amount = wasmModule._js_getRecipientAmount(recipientPtr);
        const subtractFeeFlag = wasmModule._js_getRecipientSubtractFeeFromAmountFlag(recipientPtr);

        recipientsOutput.push({
            scriptPubKey: Array.from(scriptPubKey).map(b => b.toString(16).padStart(2, '0')).join(''),
            amount,
            subtractFeeFlag
        })
    }

    return recipientsOutput;
}
