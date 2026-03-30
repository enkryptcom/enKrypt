import { wasmInstance } from '@/libs/utils/wasm-loader';
import {
  getIncomingViewKey,
  getSpendKeyObj,
} from '@/libs/spark-handler/generateSparkWallet';
import { getSparkCoinInfo } from '@/libs/spark-handler/getSparkCoinInfo';
import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import {
  OwnedCoinData,
  removeDuplicates,
} from '@action/workers/sparkCoinInfoWorker';
import * as bitcoin from 'bitcoinjs-lib';
import { isSparkAddress } from '@/providers/bitcoin/libs/utils';
import { getSerializedCoin } from '@/libs/spark-handler/getSerializedCoin';
import {
  base64ToReversedHex,
  numberToReversedHex,
} from '@/libs/spark-handler/utils';
import { LOCK_TIME, SPARK_TX_TYPE } from '@/libs/spark-handler/constants';
import { intersectSets } from '@action/utils/set-utils';
import { createTempFromSparkTx } from '@/libs/spark-handler/createTempFromSparkTx';
import BigNumber from 'bignumber.js';

type SpendCoin = {
  coin: string[];
  setId: number;
  metadata: number;
  value: number;
};

const getRequestedAmount = (amount: string) =>
  new BigNumber(amount)
    .multipliedBy(10 ** 8)
    .integerValue(BigNumber.ROUND_CEIL)
    .toNumber();

const selectSpendCoins = (
  spendCoinList: SpendCoin[],
  requestedAmount: number,
): SpendCoin[] =>
  [...spendCoinList]
    .sort((leftCoin, rightCoin) => rightCoin.value - leftCoin.value)
    .reduce<SpendCoin[]>((selectedCoins, spendCoin) => {
      const selectedAmount = selectedCoins.reduce(
        (total, coin) => total + coin.value,
        0,
      );

      if (selectedAmount >= requestedAmount) {
        return selectedCoins;
      }

      selectedCoins.push(spendCoin);
      return selectedCoins;
    }, []);

const buildFinalSparkSpendTransaction = ({
  networkInfo,
  scripts,
  to,
  isSparkTransaction,
  requestedAmount,
  serializedSpendHex,
  serializedSpendSize,
}: {
  networkInfo: bitcoin.Network;
  scripts: Uint8Array[];
  to: string;
  isSparkTransaction: boolean;
  requestedAmount: number;
  serializedSpendHex: string;
  serializedSpendSize: number;
}) => {
  const tx = new bitcoin.Transaction();
  tx.version = 3 | (SPARK_TX_TYPE << 16);
  tx.locktime = LOCK_TIME;
  tx.addInput(
    Buffer.alloc(32, 0),
    4294967295,
    4294967295,
    Buffer.from('d3', 'hex'),
  );

  scripts.forEach(script => {
    tx.addOutput(Buffer.from(script), 0);
  });

  if (!isSparkTransaction) {
    tx.addOutput(
      bitcoin.address.toOutputScript(to, networkInfo),
      requestedAmount,
    );
  }

  return (
    tx.toHex() +
    'fd' +
    numberToReversedHex(serializedSpendSize) +
    serializedSpendHex
  );
};

export async function sendFromSparkAddress(
  networkInfo: bitcoin.Network,
  to: string,
  amount: string,
): Promise<string | undefined> {
  let spendKeyObj = 0;
  let fullViewKeyObj = 0;
  let incomingViewKeyObj = 0;
  let senderAddressObj = 0;
  let recipientAddressObj = 0;
  let recipientsVector = 0;
  let privateRecipientsVector = 0;
  let coinsList = 0;
  let coverSetDataMap = 0;
  let idAndBlockHashesMap = 0;
  let result = 0;
  let deserializedCoinObj = 0;
  let coverSetData = 0;
  const diversifier = 1n;
  const isTestNetwork = networkInfo.bech32 === 'tb';
  const requestedAmount = getRequestedAmount(amount);
  const db = new IndexedDBHelper();
  const Module = await wasmInstance.getInstance();
  const cleanup = () => {
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
    if (senderAddressObj && senderAddressObj !== 0) {
      Module.ccall('js_freeAddress', null, ['number'], [senderAddressObj]);
    }
    if (recipientAddressObj && recipientAddressObj !== 0) {
      Module.ccall('js_freeAddress', null, ['number'], [recipientAddressObj]);
    }
    if (recipientsVector) {
      Module.ccall(
        'js_freeSparkSpendRecipientsVector',
        null,
        ['number'],
        [recipientsVector],
      );
    }
    if (coinsList) {
      Module.ccall('js_freeSparkSpendCoinsList', null, ['number'], [coinsList]);
    }
    if (coverSetDataMap && coverSetDataMap !== 0) {
      Module.ccall(
        'js_freeCoverSetDataMapForCreateSparkSpendTransaction',
        null,
        ['number'],
        [coverSetDataMap],
      );
    }
    if (privateRecipientsVector) {
      Module.ccall(
        'js_freeSparkSpendPrivateRecipientsVector',
        null,
        ['number'],
        [privateRecipientsVector],
      );
    }
    if (idAndBlockHashesMap) {
      Module.ccall(
        'js_freeIdAndBlockHashesMap',
        null,
        ['number'],
        [idAndBlockHashesMap],
      );
    }
    if (deserializedCoinObj) {
      Module._free(deserializedCoinObj);
    }
    if (result && result !== 0) {
      Module.ccall(
        'js_freeCreateSparkSpendTxResult',
        null,
        ['number'],
        [result],
      );
    }
    if (coverSetData && coverSetData !== 0) {
      Module.ccall('js_freeCoverSetData', null, ['number'], [coverSetData]);
    }
  };

  spendKeyObj = await getSpendKeyObj(Module);
  const isSparkTransaction = await isSparkAddress(to);

  const ownedCoins = ((await db.readData('myCoins')) || []) as OwnedCoinData[];

  const usedCoinsTags = await db.readData<{ tags: string[] }>(
    DB_DATA_KEYS.usedCoinsTags,
  );
  const coinsTagsSet = new Set(usedCoinsTags?.tags ?? []);
  const myCoinsTagsSet = new Set((ownedCoins ?? []).map(coin => coin.tag));

  const usedMyCoinsTagsSet = intersectSets(coinsTagsSet, myCoinsTagsSet);
  const revalidatedCoins = ownedCoins.filter(ownedCoin => {
    return !usedMyCoinsTagsSet.has(ownedCoin.tag);
  });

  const revalidatedUniqueCoins = Array.from(
    removeDuplicates(new Set(revalidatedCoins)),
  );

  const spendCoinList: SpendCoin[] = [];

  const keyObjects = await getIncomingViewKey(Module, spendKeyObj);

  incomingViewKeyObj = keyObjects.incomingViewKeyObj;
  fullViewKeyObj = keyObjects.fullViewKeyObj;

  senderAddressObj = Module.ccall(
    'js_getAddress',
    'number',
    ['number', 'number'],
    [incomingViewKeyObj, diversifier],
  );

  if (isSparkTransaction) {
    recipientAddressObj = Module.ccall(
      'js_decodeAddress',
      'number',
      ['string', 'number'],
      [to, Number(isTestNetwork)],
    );

    if (recipientAddressObj === 0) {
      throw new Error('Failed to decode Spark recipient address');
    }
  }

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
      [recipientsVector, BigInt(requestedAmount), 0],
    );
  }

  privateRecipientsVector = Module.ccall(
    'js_createPrivateRecipientsVectorForCreateSparkSpendTransaction',
    'number',
    ['number'],
    [1], // intended final size
  );

  coinsList = Module.ccall(
    'js_createCoinsListForCreateSparkSpendTransaction',
    'number',
    [],
    [],
  );

  const coinMetaPromiseList: Promise<void>[] = [];

  revalidatedUniqueCoins.forEach(ownedCoin => {
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
            value: Number(data.value),
          });
        }
      })
      .catch(err => {
        console.error('Error getting spark coin info', err);
      });
    coinMetaPromiseList.push(myCoinMetaData);
  });

  await Promise.allSettled(coinMetaPromiseList);

  const selectedSpendCoins = selectSpendCoins(spendCoinList, requestedAmount);

  const selectedSpendAmount = selectedSpendCoins.reduce(
    (total, coin) => total + coin.value,
    0,
  );
  const privateRecipientAmount = isSparkTransaction
    ? requestedAmount
    : selectedSpendAmount - requestedAmount;

  if (!selectedSpendCoins.length || selectedSpendAmount < requestedAmount) {
    cleanup();
    throw new Error(
      `Not enough Spark balance to cover transaction amount. Requested ${requestedAmount}, selected ${selectedSpendAmount}.`,
    );
  }

  Module.ccall(
    'js_addPrivateRecipientForCreateSparkSpendTransaction',
    null,
    ['number', 'number', 'number', 'string', 'number'],
    [
      privateRecipientsVector,
      isSparkTransaction ? recipientAddressObj : senderAddressObj,
      BigInt(privateRecipientAmount),
      'Private memo',
      1,
    ],
  );

  selectedSpendCoins.forEach(spendCoin => {
    Module.ccall(
      'js_setCSparkMintMetaId', // C++ function name
      null, // Return type
      ['number', 'number'], // Argument types
      [spendCoin.metadata, spendCoin.setId],
    );
  });

  try {
    selectedSpendCoins.forEach(spendCoin => {
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

  const groupedBySet = selectedSpendCoins.reduce(
    (acc, coin) => {
      if (!acc[coin.setId]) {
        acc[coin.setId] = [];
      }
      acc[coin.setId]?.push(coin);
      return acc;
    },
    {} as Record<number, typeof spendCoinList>,
  );

  const deserializedCoinList: Record<string, number[]> = {};
  const setsDataMap: Record<
    string,
    Awaited<ReturnType<typeof db.getSetById>>
  > = {};

  for (const setId in groupedBySet) {
    setsDataMap[setId] = await db.getSetById(Number(setId));
  }

  for (const set in groupedBySet) {
    const fullSet = setsDataMap[set];
    if (!fullSet) {
      console.error(`Set with ID ${set} not found in database`);
      continue;
    }
    fullSet.coins.forEach(coin => {
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

  for (const setId in groupedBySet) {
    const fullSet = setsDataMap[setId];
    if (!fullSet) {
      console.error(`Set with ID ${setId} not found in database`);
      continue;
    }

    const coverSetRepresentation = Buffer.from(fullSet.setHash, 'base64');
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

  for (const setId in groupedBySet) {
    const fullSet = setsDataMap[setId];
    if (!fullSet) {
      console.error(`Set with ID ${setId} not found in database`);
      continue;
    }

    Module.ccall(
      'js_addIdAndBlockHashForCreateSparkSpendTransaction',
      null,
      ['number', 'number', 'string'],
      [
        idAndBlockHashesMap,
        BigInt(setId),
        base64ToReversedHex(fullSet.blockHash),
      ],
    );
  }

  const { txHashSig, additionalTxSize } = await createTempFromSparkTx({
    network: networkInfo,
    to,
    amount,
  });

  //tempTx// tx.signInput(0, spendKeyObj);  // ? how to sign? Is I need to sign wit all utxo keypairs? // ? how to add subtractFeeFromAmount? // ? what is spend transaction type? // https://github.com/firoorg/sparkmobile/blob/main/include/spark.h#L22
  // tx.finalizeAllInputs();
  // const txHash = tx.extractTransaction()

  // const txHashSig = txHash.getHash()

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

  if (!result) {
    cleanup();
    throw new Error(
      'Failed to create Spark spend transaction. Wasm returned a null result; check the preceding Spark wasm logs for the specific reason.',
    );
  }

  const serializedSpend = Module.ccall(
    'js_getCreateSparkSpendTxResultSerializedSpend',
    'number', // returns a pointer to the beginning of a byte array
    ['number'],
    [result],
  );

  const serializedSpendSize = Module.ccall(
    'js_getCreateSparkSpendTxResultSerializedSpendSize',
    'number',
    ['number'],
    [result],
  );

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
    const scriptSize = Module.ccall(
      'js_getCreateSparkSpendTxResultOutputScriptSizeAt',
      'number',
      ['number', 'number'],
      [result, i],
    );

    const script = new Uint8Array(Module.HEAPU8.buffer, scriptPtr, scriptSize);

    scripts.push(script);
  }
  const finalTx = buildFinalSparkSpendTransaction({
    networkInfo,
    scripts,
    to,
    isSparkTransaction,
    requestedAmount,
    serializedSpendHex: hex,
    serializedSpendSize,
  });
  cleanup();
  return finalTx;
}
