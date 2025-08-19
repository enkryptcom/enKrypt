import { wasmInstance } from '@/libs/utils/wasm-loader.ts';
import {
  getIncomingViewKey,
  getSpendKeyObj,
} from '@/libs/spark-handler/generateSparkWallet.ts';
import { getSparkCoinInfo } from '@/libs/spark-handler/getSparkCoinInfo.ts';
import { IndexedDBHelper } from '@action/db/indexedDB.ts';
import { OwnedCoinData } from '@action/workers/sparkCoinInfoWorker.ts';
import * as bitcoin from 'bitcoinjs-lib';
import { PublicFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/public-firo-wallet.ts';
import { Buffer } from 'bitcoinjs-lib/src/types';
// import bitcore from 'bitcore-lib';

export async function sendFromSparkAddress(
  network: bitcoin.Network,
  to: string,
  amount: string,
  subtractFee = false,
) {
  const diversifier = 1n;
  const db = new IndexedDBHelper();
  const wallet = new PublicFiroWallet();
  const Module = await wasmInstance.getInstance();
  const spendKeyObj = await getSpendKeyObj(Module);

  const ownedCoins = ((await db.readData('myCoins')) || []) as OwnedCoinData[];

  const uniqCoinsObj = ownedCoins.reduce(
    (acc: Record<string, OwnedCoinData>, coin) => {
      const coinHash = coin.coin[0];
      if (!acc[coinHash]) {
        acc[coinHash] = coin;
      }
      return acc;
    },
    {},
  );

  const uniqCoins = Object.values(uniqCoinsObj);
  console.log('%cuniqCoins', 'color: yellow; font-size: 24px;', uniqCoins);

  const metadataObjList: number[] = [];
  const deserializedCoinList: number[] = [];
  const coinHashList: string[] = [];
  const blockHashList: string[] = [];
  const setHashList: string[] = [];

  const { incomingViewKeyObj, fullViewKeyObj } = await getIncomingViewKey(
    Module,
    spendKeyObj,
  );

  const addressObj = Module.ccall(
    'js_getAddress',
    'number',
    ['number', 'number'],
    [incomingViewKeyObj, diversifier],
  );

  // Create recipients vector for spend transaction
  const recipientsVector = Module.ccall(
    'js_createRecipientsVectorForCreateSparkSpendTransaction',
    'number',
    ['number'],
    [1], // intended final size
  );

  Module.ccall(
    'js_addRecipientForCreateSparkSpendTransaction',
    null,
    ['number', 'number', 'number'],
    [recipientsVector, 1000n, 0],
  );

  const privateRecipientsVector = Module.ccall(
    'js_createPrivateRecipientsVectorForCreateSparkSpendTransaction',
    'number',
    ['number'],
    [1], // intended final size
  );

  Module.ccall(
    'js_addPrivateRecipientForCreateSparkSpendTransaction',
    null,
    ['number', 'number', 'number', 'string', 'number'],
    [privateRecipientsVector, addressObj, 100000n, 'Private memo', 1], // TODO: change amount to dynamyc
  );

  const coinsList = Module.ccall(
    'js_createCoinsListForCreateSparkSpendTransaction',
    'number',
    [],
    [],
  );

  const coinMetaPromiseList: Promise<void>[] = [];

  uniqCoins.forEach(ownedCoin => {
    const myCoinMetaData = getSparkCoinInfo({
      coin: ownedCoin.coin,
      fullViewKeyObj,
      incomingViewKeyObj,
      wasmModule: Module,
      keepMemory: true,
    })
      .then(data => {
        console.log('%cdata', 'color: yellow; font-size: 24px;', data);
        if (!data.isUsed) {
          metadataObjList.push(data.metaData);
          deserializedCoinList.push(data.deserializedCoinObj);
          setHashList.push(ownedCoin.setHash);
          blockHashList.push(ownedCoin.blockHash);
        }
      })
      .catch(err => {
        console.error('Error getting spark coin info', err);
      });
    coinMetaPromiseList.push(myCoinMetaData);
  });

  console.log('coinMetaPromiseList', coinMetaPromiseList);
  await Promise.allSettled(coinMetaPromiseList);

  deserializedCoinList.forEach(deserializedCoinObj => {
    // Example usage of `js_getCSparkMintMetaId`
    const metaId = Module.ccall(
      'js_getCoinHash',
      'string',
      ['number'],
      [deserializedCoinObj],
    );

    coinHashList.push(metaId);
  });

  const coinIds = await wallet.getSparkMintMetadata(coinHashList);

  console.log('coinIds ==> ==>', coinIds);

  console.log('metadataObjList', metadataObjList);

  deserializedCoinList.forEach(deserializedCoinObj => {
    const metaId = Module.ccall(
      'js_getCoinHash',
      'string',
      ['number'],
      [deserializedCoinObj],
    );

    console.log('metaId: ', metaId);
  });

  metadataObjList.forEach(metadataObj => {
    Module.ccall(
      'js_setCSparkMintMetaId', // C++ function name
      null, // Return type
      ['number', 'number'], // Argument types
      [metadataObj, 7], // Arguments - example ID value
    );
  });

  try {
    metadataObjList.forEach(metadataObj => {
      Module.ccall(
        'js_addCoinToListForCreateSparkSpendTransaction',
        null,
        ['number', 'number'],
        [coinsList, metadataObj],
      );
    });
  } catch (error) {
    console.error('Error adding coins to list:', error);
  }
  const coverSetDataMap = Module.ccall(
    'js_createCoverSetDataMapForCreateSparkSpendTransaction',
    'number',
    [],
    [],
  );

  setHashList.forEach((setHash, index) => {
    const coverSetRepresentation = new TextEncoder().encode(setHash);
    const coverSetRepresentationPointer = Module._malloc(
      coverSetRepresentation.length,
    );
    Module.HEAPU8.set(coverSetRepresentation, coverSetRepresentationPointer);

    const coverSetData = Module.ccall(
      'js_createCoverSetData',
      'number',
      ['number', 'number'],
      [coverSetRepresentationPointer, coverSetRepresentation.length],
    );

    deserializedCoinList.forEach(deserializedCoin => {
      Module.ccall(
        'js_addCoinToCoverSetData',
        null,
        ['number', 'number'],
        [coverSetData, deserializedCoin],
      );
    });

    // Add cover set data to map (with group ID 1)
    Module.ccall(
      'js_addCoverSetDataForCreateSparkSpendTransaction',
      null,
      ['number', 'number', 'number'],
      [coverSetDataMap, 7n, coverSetData],
    );
  });

  // const coverSetRepresentation = new Uint8Array([0x21, 0x43, 0x65, 0x87, 0xA9, 0xCB]); // set hashn a
  // const coverSetRepresentationPointer = Module._malloc(coverSetRepresentation.length);
  // Module.HEAPU8.set(coverSetRepresentation, coverSetRepresentationPointer); // Copy to Wasm memory

  // Create cover set data
  // const coverSetData = Module.ccall(
  //   "js_createCoverSetData",
  //   "number",
  //   ["number", "number"],
  //   [coverSetRepresentationPointer, coverSetRepresentation.length]
  // );

  // Create ID and block hashes map
  const idAndBlockHashesMap = Module.ccall(
    'js_createIdAndBlockHashesMapForCreateSparkSpendTransaction',
    'number',
    [],
    [],
  );

  blockHashList.forEach(blockHash => {
    Module.ccall(
      'js_addIdAndBlockHashForCreateSparkSpendTransaction',
      null,
      ['number', 'number', 'string'],
      [idAndBlockHashesMap, 7n, blockHash],
    );
  });

  // dummy values

  const txHashSig =
    '0000000000000000000000000000000000000000000000000000000000000000';

  // const tx = new bitcore.Transaction()

  // const tx = new bitcoin.Psbt({
  //   network,
  // });
  // tx.setVersion(3);
  // tx.setLocktime((new Date().getTime() / 1000));
  // tx.addOutput({
  //   address: to,
  //   value: parseInt(amount, 10),
  // });

  // ? what is spend transaction type? // https://github.com/firoorg/sparkmobile/blob/main/include/spark.h#L22

  // ? how to add subtractFeeFromAmount?

  // tx.signInput(0, spendKeyObj);  // ? how to sign? Is I need to sign wit all utxo keypairs?
  // tx.finalizeAllInputs();
  // const txHash = tx.extractTransaction()

  // const txHashSig = txHash.getHash()

  console.log('txHashSig');
  const additionalTxSize = 0;

  // Create the spend transaction
  const result = Module.ccall(
    'js_createSparkSpendTransaction',
    'number',
    [
      'number',
      'number',
      'number',
      'number',
      'number',
      'number',
      'number',
      'number',
      'string',
      'number',
    ],
    [
      spendKeyObj,
      fullViewKeyObj,
      incomingViewKeyObj,
      recipientsVector,
      privateRecipientsVector,
      coinsList,
      coverSetDataMap,
      idAndBlockHashesMap,
      txHashSig,
      additionalTxSize,
    ],
  );

  console.log('final result is', result);

  if (result) {
    // Get transaction details

    const serializedSpend = Module.ccall(
      'js_getCreateSparkSpendTxResultSerializedSpend',
      'number', // returns a pointer to the beginning of a byte array
      ['number'],
      [result],
    );

    console.log('serializedSpend ==> ==>', serializedSpend);

    const serializedSpendSize = Module.ccall(
      'js_getCreateSparkSpendTxResultSerializedSpendSize',
      'number',
      ['number'],
      [result],
    );

    console.log(`Serialized spend size: `, serializedSpendSize);

    const serializedSpendBytes = new Uint8Array(
      Module.HEAPU8.buffer,
      serializedSpend,
      serializedSpendSize,
    );

    // Make a copy (optional, because the above is just a view into WASM memory)
    const spendDataCopy = new Uint8Array(serializedSpendBytes);

    // If you need hex
    const hex = Array.from(spendDataCopy)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('Serialized Spend (hex):', hex);

    const outputScriptsSize = Module.ccall(
      'js_getCreateSparkSpendTxResultOutputScriptsSize',
      'number',
      ['number'],
      [result],
    );

    // Get each output script
    for (let i = 0; i < outputScriptsSize; i++) {
      const script = Module.ccall(
        'js_getCreateSparkSpendTxResultOutputScriptAt',
        'number', // returns a pointer to the beginning of a byte array
        ['number', 'number'],
        [result, i],
      );

      console.log(`Output script in for:`, script);
      const scriptSize = Module.ccall(
        'js_getCreateSparkSpendTxResultOutputScriptSizeAt',
        'number',
        ['number', 'number'],
        [result, i],
      );
      console.log(`Output script ${i} size: ${scriptSize}`);
    }

    // Get spent coins information
    const spentCoinsSize = Module.ccall(
      'js_getCreateSparkSpendTxResultSpentCoinsSize',
      'number',
      ['number'],
      [result],
    );

    console.log(`Spent coins size: ${spentCoinsSize}`);

    for (let i = 0; i < spentCoinsSize; i++) {
      const spentCoinMeta = Module.ccall(
        'js_getCreateSparkSpendTxResultSpentCoinAt',
        'number',
        ['number', 'number'],
        [result, i],
      );
      const spentCoinValue = Module.ccall(
        'js_getCSparkMintMetaValue',
        'number',
        ['number'],
        [spentCoinMeta],
      );
      console.log(
        `Spent coin ${i} having value ${spentCoinValue} retrieved`,
        spentCoinMeta,
      );
    }

    // Get transaction fee
    const fee = Module.ccall(
      'js_getCreateSparkSpendTxResultFee',
      'number',
      ['number'],
      [result],
    );
    console.log(`Transaction fee: ${fee}`);

    console.log('network ==> =========>>', network);
    const psbt = new bitcoin.Psbt({ network });

    psbt.addOutput({
      script: Buffer.from(spendDataCopy),
      value: 100000,
    });

    const Signer = {
      sign: (hash: Uint8Array) => {
        return Buffer.from(keyPair.sign(hash));
      },
      publicKey: Buffer.from(keyPair.publicKey),
    } as unknown as bitcoin.Signer;

    psbt.signInput(0, Signer);
    // todo: free memory
  }
}
