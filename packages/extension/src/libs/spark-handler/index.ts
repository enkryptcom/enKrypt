import { wasmInstance } from '@/libs/utils/wasm-loader';
import {
  getIncomingViewKey,
  getSpendKeyObj,
} from '@/libs/spark-handler/generateSparkWallet';
import { getSparkCoinInfo } from '@/libs/spark-handler/getSparkCoinInfo';
import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import { OwnedCoinData } from '@action/workers/sparkCoinInfoWorker';
import * as bitcoin from 'bitcoinjs-lib';
import { isSparkAddress } from '@/providers/bitcoin/libs/utils';
import {
  base64ToHex,
  getSerializedCoin,
} from '@/libs/spark-handler/getSerializedCoin';
import {
  base64ToReversedHex,
  numberToReversedHex,
} from '@/libs/spark-handler/utils';
import { LOCK_TIME, SPARK_TX_TYPE } from '@/libs/spark-handler/constants';
import { intersectSets } from '@action/utils/set-utils';

export async function sendFromSparkAddress(
  network: bitcoin.Network,
  to: string,
  amount: string,
): Promise<string | undefined> {
  let spendKeyObj = 0;
  let fullViewKeyObj = 0;
  let incomingViewKeyObj = 0;
  let addressObj = 0;
  let recipientsVector = 0;
  let privateRecipientsVector = 0;
  let coinsList = 0;
  let coverSetDataMap = 0;
  let idAndBlockHashesMap = 0;
  let result = 0;
  let deserializedCoinObj = 0;
  let coverSetData = 0;
  const diversifier = 1n;
  const db = new IndexedDBHelper();
  const Module = await wasmInstance.getInstance();

  spendKeyObj = await getSpendKeyObj(Module);
  const isSparkTransaction = await isSparkAddress(to);

  const ownedCoins = ((await db.readData('myCoins')) ||
    []) as OwnedCoinData[];

  const usedCoinsTags = await db.readData<{ tags: string[] }>(
    DB_DATA_KEYS.usedCoinsTags,
  );
  const coinsTagsSet = new Set(usedCoinsTags.tags);
  const myCoinsTagsSet = new Set((ownedCoins ?? []).map(coin => coin.tag));

  const usedMyCoinsTagsSet = intersectSets(coinsTagsSet, myCoinsTagsSet);
  const revalidatedCoins = ownedCoins.filter(ownedCoin => {
    return !usedMyCoinsTagsSet.has(ownedCoin.tag);
  });

  const spendCoinList: {
    coin: string[];
    setId: number;
    metadata: number;
    deserializedCoinObj: number;
  }[] = [];

  const keyObjects = await getIncomingViewKey(
    Module,
    spendKeyObj,
  );

  incomingViewKeyObj = keyObjects.incomingViewKeyObj
  fullViewKeyObj = keyObjects.fullViewKeyObj

  addressObj = Module.ccall(
    'js_getAddress',
    'number',
    ['number', 'number'],
    [incomingViewKeyObj, diversifier],
  );

  // Create recipients vector for spend transaction
  recipientsVector = Module.ccall(
    'js_createRecipientsVectorForCreateSparkSpendTransaction',
    'number',
    ['number'],
    [1], // intended final size
  );

  if (!isSparkTransaction) {
    Module.ccall(
      'js_addRecipientForCreateSparkSpendTransaction',
      null,
      ['number', 'number', 'number'],
      [recipientsVector, BigInt(+amount * 10 ** 8), 0],
    );
  }

  privateRecipientsVector = Module.ccall(
    'js_createPrivateRecipientsVectorForCreateSparkSpendTransaction',
    'number',
    ['number'],
    [1], // intended final size
  );

  Module.ccall(
    'js_addPrivateRecipientForCreateSparkSpendTransaction',
    null,
    ['number', 'number', 'number', 'string', 'number'],
    [
      privateRecipientsVector,
      addressObj,
      BigInt(+amount * 10 ** 8),
      'Private memo',
      1,
    ],
  );

  coinsList = Module.ccall(
    'js_createCoinsListForCreateSparkSpendTransaction',
    'number',
    [],
    [],
  );

  const coinMetaPromiseList: Promise<void>[] = [];

  revalidatedCoins.forEach(ownedCoin => {
    const myCoinMetaData = getSparkCoinInfo({
      coin: ownedCoin.coin,
      fullViewKeyObj,
      incomingViewKeyObj,
      wasmModule: Module,
      keepMemory: true,
    })
      .then(data => {
        if (!data.isUsed) {
          spendCoinList.push({
            coin: ownedCoin.coin,
            setId: ownedCoin.setId,
            metadata: data.metaData,
            deserializedCoinObj: data.deserializedCoinObj,
          });
        } else {
        }
      })
      .catch(err => {
        console.error('Error getting spark coin info', err);
      });
    coinMetaPromiseList.push(myCoinMetaData);
  });

  await Promise.allSettled(coinMetaPromiseList);

  spendCoinList.forEach(spendCoin => {
    Module.ccall(
      'js_setCSparkMintMetaId', // C++ function name
      null, // Return type
      ['number', 'number'], // Argument types
      [spendCoin.metadata, spendCoin.setId],
    );
  });

  try {
    spendCoinList.forEach(spendCoin => {
      Module.ccall(
        'js_addCoinToListForCreateSparkSpendTransaction',
        null,
        ['number', 'number'],
        [coinsList, spendCoin.metadata],
      );
    });
  } catch (error) {
    console.error('Error adding coins to list:', error);
  }
  coverSetDataMap = Module.ccall(
    'js_createCoverSetDataMapForCreateSparkSpendTransaction',
    'number',
    [],
    [],
  );

  const groupedBySet = spendCoinList.reduce(
    (acc, coin) => {
      if (!acc[coin.setId]) {
        acc[coin.setId] = [];
      }
      acc[coin.setId].push(coin);
      return acc;
    },
    {} as Record<number, typeof spendCoinList>,
  );

  console.debug('groupedBySet', groupedBySet);

  const deserializedCoinList: Record<string, number[]> = {};
  // TODO: move to separate function

  for (const set in groupedBySet) {
    const fullSet = await db.getSetById(Number(set));
    fullSet?.coins.forEach(coin => {
      const serializedCoin = getSerializedCoin(
        coin[0] as string,
      ) as unknown as ArrayLike<number>;

      const serializedCoinPointer = Module._malloc(serializedCoin.length);
      Module.HEAPU8.set(serializedCoin, serializedCoinPointer);

      const serialContext = getSerializedCoin(
        coin[2] as string,
      ) as unknown as ArrayLike<number>;

      const serialContextPointer = Module._malloc(serialContext.length);
      Module.HEAPU8.set(serialContext, serialContextPointer);

      deserializedCoinObj = Module.ccall(
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

      if (!deserializedCoinList[set]) {
        deserializedCoinList[set] = [];
      }
      deserializedCoinList[set].push(deserializedCoinObj);
    });
  }

  const setHashList = await db.getSetHashes();

  for (const setId in groupedBySet) {
    const coverSetRepresentation = Buffer.from(
      setHashList[+setId - 1],
      'base64',
    );
    console.debug('coverSetRepresentation :=>', coverSetRepresentation);
    const coverSetRepresentationPointer = Module._malloc(
      coverSetRepresentation.length,
    );
    Module.HEAPU8.set(coverSetRepresentation, coverSetRepresentationPointer);

    coverSetData = Module.ccall(
      'js_createCoverSetData',
      'number',
      ['number', 'number'],
      [coverSetRepresentationPointer, coverSetRepresentation.length],
    );

    console.debug(groupedBySet, setId);
    deserializedCoinList[setId].forEach(deserializedCoin => {
      Module.ccall(
        'js_addCoinToCoverSetData',
        null,
        ['number', 'number'],
        [coverSetData, deserializedCoin],
      );
      // console.count('Deserialized coin added');
    });

    // Add cover set data to map (with group ID 1)
    Module.ccall(
      'js_addCoverSetDataForCreateSparkSpendTransaction',
      null,
      ['number', 'number', 'number'],
      [coverSetDataMap, BigInt(setId), coverSetData],
    );
  }

  idAndBlockHashesMap = Module.ccall(
    'js_createIdAndBlockHashesMapForCreateSparkSpendTransaction',
    'number',
    [],
    [],
  );

  const blockHashList = await db.getBlockHashes();
  console.log('blockHashList =>>>', blockHashList);
  for (const setId in groupedBySet) {
    console.log(BigInt(setId), base64ToHex(blockHashList[+setId - 1]));
    Module.ccall(
      'js_addIdAndBlockHashForCreateSparkSpendTransaction',
      null,
      ['number', 'number', 'string'],
      [
        idAndBlockHashesMap,
        BigInt(setId),
        base64ToReversedHex(blockHashList[+setId - 1]),
      ],
    );
  }

  const tempTx = new bitcoin.Psbt({ network: network.networkInfo });
  tempTx.setVersion(3 | (SPARK_TX_TYPE << 16)); // version 3 and tx type in high bits (3 | (SPARK_TX_TYPE << 16));
  tempTx.setLocktime(LOCK_TIME); // new Date().getTime() / 1000

  tempTx.addInput({
    hash: '0000000000000000000000000000000000000000000000000000000000000000',
    index: 4294967295,
    sequence: 4294967295,
    finalScriptSig: Buffer.from('d3', 'hex'),
  });

  const tempTxBuffer = tempTx.extractTransaction(true).toBuffer();
  const extendedTempTxBuffer = Buffer.concat([
    tempTxBuffer,
    Buffer.from([0x00]),
  ]);

  const txHash = bitcoin.crypto.hash256(extendedTempTxBuffer);
  const txHashSig = txHash.reverse().toString('hex');

  // TODO: check not spark case
  if (!isSparkTransaction) {
    tempTx.addOutput({
      address: to,
      value: new BigNumber(amount).multipliedBy(10 ** 8).toNumber(),
    });
  }

  //tempTx// tx.signInput(0, spendKeyObj);  // ? how to sign? Is I need to sign wit all utxo keypairs? // ? how to add subtractFeeFromAmount? // ? what is spend transaction type? // https://github.com/firoorg/sparkmobile/blob/main/include/spark.h#L22
  // tx.finalizeAllInputs();
  // const txHash = tx.extractTransaction()

  // const txHashSig = txHash.getHash()

  console.log('coinlist', coinsList);
  const additionalTxSize = 0;

  // Create the spend transaction
  result = Module.ccall(
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
  const scripts = [];

  // Get each output script
  for (let i = 0; i < outputScriptsSize; i++) {
    const scriptPtr = Module.ccall(
      'js_getCreateSparkSpendTxResultOutputScriptAt',
      'number', // returns a pointer to the beginning of a byte array
      ['number', 'number'],
      [result, i],
    );

    console.log(`Output script in for:`, scriptPtr);
    const scriptSize = Module.ccall(
      'js_getCreateSparkSpendTxResultOutputScriptSizeAt',
      'number',
      ['number', 'number'],
      [result, i],
    );
    console.log(`Output script ${i} size: ${scriptSize}`);

    const script = new Uint8Array(Module.HEAPU8.buffer, scriptPtr, scriptSize);

    scripts.push(script);
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

    // const coinPtr = Module.ccall(
    //   '_js_getCoinFromMeta',
    //   'number',
    //   ['number', 'number'],
    //   [spentCoinMeta, incomingViewKeyObj],
    // );
    //
    // const hash = Module.ccall(
    //   '_js_getCoinHash',
    //   'number',
    //   ['number'],
    //   [coinPtr],
    // );
    //
    // console.log(
    //   `coin hash  =>>>>>>======>>>>><<<<<======<<<<<<<======: ${hash}`,
    // );
    const spentCoinMetaDeserialized = new Uint8Array(
      Module.HEAPU8.buffer,
      spentCoinMeta,
      spentCoinMeta.length,
    );

    console.log(
      `spend coins meta @nd value ${spentCoinValue}, ${spentCoinMeta}  ${spentCoinMetaDeserialized.toString()}`,
    );
  }

  // Get transaction fee
  // const fee = Module.ccall(
  //   'js_getCreateSparkSpendTxResultFee',
  //   'number',
  //   ['number'],
  //   [result],
  // );

  const psbt = new bitcoin.Psbt({ network: network.networkInfo });

  // const api = (await network.api()) as unknown as FiroAPI;

  psbt.addInput({
    hash: '0000000000000000000000000000000000000000000000000000000000000000',
    index: 4294967295,
    sequence: 4294967295,
    finalScriptSig: Buffer.from('d3', 'hex'),
  });

  psbt.setLocktime(LOCK_TIME);

  psbt.setVersion(3 | (SPARK_TX_TYPE << 16));
  scripts.forEach(script => {
    console.log('script is ==>', script);
    psbt.addOutput({
      script: Buffer.from(script),
      value: 0,
    });
  });

  const rawTx = psbt.extractTransaction();
  const txHex = rawTx.toHex();
  const sizeHex = numberToReversedHex(serializedSpendSize);
  const finalTx = txHex + 'fd' + sizeHex + hex;

  console.log('Final TX to broadcast:', finalTx);

  if (spendKeyObj && spendKeyObj !== 0) {
    Module.ccall('js_freeSpendKey', null, ['number'], [spendKeyObj]);
  }
  if (fullViewKeyObj && fullViewKeyObj !== 0) {
    Module.ccall('js_freeFullViewKey', null, ['number'], [fullViewKeyObj]);
  }
  if (incomingViewKeyObj && incomingViewKeyObj !== 0) {
    Module.ccall(
      'js_freeIncomingViewKey',
      null,
      ['number'],
      [incomingViewKeyObj],
    );
  }
  if (addressObj && addressObj !== 0) {
    Module.ccall('js_freeAddress', null, ['number'], [addressObj]);
  }
  if (recipientsVector) {
    Module._free(recipientsVector);
  }
  if (coinsList) {
    Module._free(coinsList);
  }
  if (coverSetDataMap && coverSetDataMap !== 0) {
    Module.ccall(
      'js_freeCoverSetDataMapForCreateSparkSpendTransaction',
      null,
      ['number'],
      [addressObj],
    );
  }
  if (privateRecipientsVector) {
    Module._free(privateRecipientsVector);
  }
  if (idAndBlockHashesMap) {
    Module._free(idAndBlockHashesMap);
  }
  if (deserializedCoinObj) {
    Module._free(deserializedCoinObj);
  }
  if (result && result !== 0) {
    Module.ccall('js_freeCreateSparkSpendTxResult', null, ['number'], [result]);
  }
  if (coverSetData && coverSetData !== 0) {
    Module.ccall('js_freeCoverSetData', null, ['number'], [coverSetData]);
  }

  return finalTx;
}
