import {
  getIncomingViewKey,
  getSpendKeyObj,
} from '@/libs/spark-handler/generateSparkWallet';
import { getSparkCoinInfo } from '@/libs/spark-handler/getSparkCoinInfo';
import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import {
  OwnedCoinData,
  removeDuplicates,
} from '@/libs/spark-handler/owned-coins';
import * as bitcoin from 'bitcoinjs-lib';
import { getSerializedCoin } from '@/libs/spark-handler/getSerializedCoin';
import {
  base64ToReversedHex,
  numberToReversedHex,
} from '@/libs/spark-handler/utils';
import {
  LOCK_TIME,
  SPARK_SPEND_VERSION,
  SPARK_TX_TYPE,
} from '@/libs/spark-handler/constants';
import { intersectSets } from '@action/utils/set-utils';
import { createTempFromSparkTx } from '@/libs/spark-handler/createTempFromSparkTx';
import { getActivePendingSpentTags } from '@/libs/utils/updateAndSync/markCoinsAsPendingSpent';
import BigNumber from 'bignumber.js';

type SpendCoin = {
  coin: string[];
  setId: number;
  metadata: number;
  value: number;
  tag: string;
};

export type SendFromSparkAddressResult = {
  hex: string;
  selectedTags: string[];
  fee: number;
  recipientAmount: number;
};

/** Build steps reported while a spend is built in the worker. */
export type SparkSpendProgress =
  | { stage: 'coins' }
  | { stage: 'prepare'; done: number; total: number }
  // The wasm makes all proofs in one call, so only an estimate is known.
  | { stage: 'prove'; inputs: number; estimatedMs: number };

/** Message the main thread sends to the spend worker. */
export type BuildSparkSpendRequest = {
  networkInfo: bitcoin.Network;
  to: string;
  amount: string;
  isMax: boolean;
  isSparkTransaction: boolean;
};

/** Messages the spend worker sends back. */
export type BuildSparkSpendMessage =
  | { type: 'progress'; progress: SparkSpendProgress }
  | { type: 'result'; result: SendFromSparkAddressResult }
  | { type: 'error'; error: string };

/** Measured on earlier builds; used to estimate the next one. */
type SparkSpendStats = {
  proofMsPerInput?: number;
  transparentFeePerInput?: number;
};

class SparkFeeShortfallError extends Error {}
/** Transparent max could not use the stored fee estimate. */
class FeeEstimateError extends Error {}

// Extra coins tried after the first attempt.
const MAX_EXTRA_COINS = 3;
const MAX_PROBE_RESERVE = 1_000_000;
const MAX_TRANSPARENT_MARGIN = 1_000;
// Safety factor on the stored fee estimate; the rest returns as change.
const FEE_ESTIMATE_BUFFER = 1.25;
const DEFAULT_PROOF_MS_PER_INPUT = 20_000;
const PREPARE_PROGRESS_STEP = 2_000;

const getRequestedAmount = (amount: string) =>
  new BigNumber(amount)
    .multipliedBy(10 ** 8)
    .integerValue(BigNumber.ROUND_CEIL)
    .toNumber();

const selectSpendCoins = (
  spendCoinList: SpendCoin[],
  requestedAmount: number,
  {
    needsFeeSlack,
    extraCoins,
    useAllCoins,
  }: { needsFeeSlack: boolean; extraCoins: number; useAllCoins: boolean },
): SpendCoin[] => {
  const sortedCoins = [...spendCoinList].sort(
    (leftCoin, rightCoin) => rightCoin.value - leftCoin.value,
  );
  if (useAllCoins) return sortedCoins;

  const selectedCoins: SpendCoin[] = [];
  let selectedAmount = 0;
  for (const spendCoin of sortedCoins) {
    const isCovered = needsFeeSlack
      ? selectedAmount > requestedAmount
      : selectedAmount >= requestedAmount;
    if (isCovered) break;
    selectedCoins.push(spendCoin);
    selectedAmount += spendCoin.value;
  }
  return selectedCoins.concat(
    sortedCoins.slice(selectedCoins.length, selectedCoins.length + extraCoins),
  );
};

const buildFinalSparkSpendTransaction = ({
  networkInfo,
  scripts,
  to,
  isSparkTransaction,
  requestedAmount,
  serializedSpendHex,
  serializedSpendSize,
  sparkTxType,
}: {
  networkInfo: bitcoin.Network;
  scripts: Uint8Array[];
  to: string;
  isSparkTransaction: boolean;
  requestedAmount: number;
  serializedSpendHex: string;
  serializedSpendSize: number;
  sparkTxType: number;
}) => {
  const tx = new bitcoin.Transaction();
  tx.version = 3 | (sparkTxType << 16);
  tx.locktime = LOCK_TIME;
  tx.addInput(
    Buffer.alloc(32, 0),
    4294967295,
    4294967295,
    Buffer.from('d3', 'hex'),
  );

  if (!isSparkTransaction) {
    tx.addOutput(
      bitcoin.address.toOutputScript(to, networkInfo),
      requestedAmount,
    );
  }

  scripts.forEach(script => {
    tx.addOutput(Buffer.from(script), 0);
  });

  return (
    tx.toHex() +
    'fd' +
    numberToReversedHex(serializedSpendSize) +
    serializedSpendHex
  );
};

type CreateSparkSpendParams = {
  Module: WasmModule;
  networkInfo: bitcoin.Network;
  to: string;
  isSparkTransaction: boolean;
  requestedAmount: number;
  feeFromAmount: boolean;
  extraCoins: number;
  useAllCoins: boolean;
  /** Spend all coins and reserve the stored fee estimate; the leftover
   * returns as change. Throws FeeEstimateError when that does not work. */
  useFeeEstimate?: boolean;
  onProgress: (progress: SparkSpendProgress) => void;
};

const readSpendStats = async (db: IndexedDBHelper) => {
  await db.waitInit();
  return (
    (await db.readData<SparkSpendStats | undefined>(
      DB_DATA_KEYS.sparkSpendStats,
    )) ?? {}
  );
};

const saveSpendStats = async (
  db: IndexedDBHelper,
  update: SparkSpendStats,
) => {
  try {
    const stats = await readSpendStats(db);
    await db.saveData(DB_DATA_KEYS.sparkSpendStats, { ...stats, ...update });
  } catch (error) {
    console.error('Failed to save Spark spend stats', error);
  }
};

async function createSparkSpend({
  Module,
  networkInfo,
  to,
  isSparkTransaction,
  requestedAmount,
  feeFromAmount,
  extraCoins,
  useAllCoins,
  useFeeEstimate = false,
  onProgress,
}: CreateSparkSpendParams): Promise<SendFromSparkAddressResult> {
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
  const db = new IndexedDBHelper();

  const sparkTxType = SPARK_TX_TYPE;
  const spendVersion = SPARK_SPEND_VERSION;

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

  onProgress({ stage: 'coins' });
  spendKeyObj = await getSpendKeyObj(Module);

  const ownedCoins = ((await db.readData('myCoins')) || []) as OwnedCoinData[];

  const usedCoinsTags = await db.readData<{ tags: string[] }>(
    DB_DATA_KEYS.usedCoinsTags,
  );
  const pendingSpentTags = await getActivePendingSpentTags();
  const coinsTagsSet = new Set([
    ...(usedCoinsTags?.tags ?? []),
    ...pendingSpentTags.map(entry => entry.tag),
  ]);
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
    [2], // intended final size
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
            tag: ownedCoin.tag,
          });
        }
      })
      .catch(err => {
        console.error('Error getting spark coin info', err);
      });
    coinMetaPromiseList.push(myCoinMetaData);
  });

  await Promise.allSettled(coinMetaPromiseList);

  const selectedSpendCoins = selectSpendCoins(spendCoinList, requestedAmount, {
    needsFeeSlack: !feeFromAmount,
    extraCoins,
    useAllCoins: useAllCoins || useFeeEstimate,
  });

  const selectedSpendAmount = selectedSpendCoins.reduce(
    (total, coin) => total + coin.value,
    0,
  );

  const spendStats = await readSpendStats(db);

  if (useFeeEstimate) {
    const feePerInput = spendStats.transparentFeePerInput;
    if (!feePerInput) {
      cleanup();
      throw new FeeEstimateError('No stored fee estimate yet.');
    }
    requestedAmount =
      selectedSpendAmount -
      Math.ceil(feePerInput * selectedSpendCoins.length * FEE_ESTIMATE_BUFFER) -
      MAX_TRANSPARENT_MARGIN;
    if (requestedAmount <= 0) {
      cleanup();
      throw new FeeEstimateError('Fee estimate is larger than the balance.');
    }
  }

  // Everything not sent to the recipient comes back as change. The change
  // output carries the "subtract fee" flag, so the fee is paid by the sender.
  const changeAmount = selectedSpendAmount - requestedAmount;

  if (!selectedSpendCoins.length || selectedSpendAmount < requestedAmount) {
    cleanup();
    throw new Error(
      `Not enough Spark balance to cover transaction amount. Requested ${requestedAmount}, selected ${selectedSpendAmount}.`,
    );
  }

  const addPrivateRecipient = (
    addressObj: number,
    value: number,
    subtractFee: boolean,
  ) =>
    Module.ccall(
      'js_addPrivateRecipientForCreateSparkSpendTransaction',
      null,
      ['number', 'number', 'number', 'string', 'number'],
      [
        privateRecipientsVector,
        addressObj,
        BigInt(value),
        'Private memo',
        Number(subtractFee),
      ],
    );

  if (isSparkTransaction) {
    addPrivateRecipient(recipientAddressObj, requestedAmount, feeFromAmount);
  }

  if (!isSparkTransaction || (!feeFromAmount && changeAmount > 0)) {
    addPrivateRecipient(senderAddressObj, changeAmount, true);
  }

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

  const totalSetCoins = Object.values(setsDataMap).reduce(
    (total, set) => total + (set?.coins.length ?? 0),
    0,
  );
  let preparedSetCoins = 0;
  onProgress({ stage: 'prepare', done: 0, total: totalSetCoins });

  for (const set in groupedBySet) {
    const fullSet = setsDataMap[set];
    if (!fullSet) {
      console.error(`Set with ID ${set} not found in database`);
      continue;
    }
    fullSet.coins.forEach(coin => {
      preparedSetCoins++;
      if (preparedSetCoins % PREPARE_PROGRESS_STEP === 0) {
        onProgress({
          stage: 'prepare',
          done: preparedSetCoins,
          total: totalSetCoins,
        });
      }

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
    amountSat: requestedAmount,
    sparkTxType,
    isSparkTransaction,
  });

  //tempTx// tx.signInput(0, spendKeyObj);  // ? how to sign? Is I need to sign wit all utxo keypairs? // ? how to add subtractFeeFromAmount? // ? what is spend transaction type? // https://github.com/firoorg/sparkmobile/blob/main/include/spark.h#L22
  // tx.finalizeAllInputs();
  // const txHash = tx.extractTransaction()

  // const txHashSig = txHash.getHash()

  // Extension commitment: empty hex for a plain spend (only Spark Name
  // registrations commit to something else). Consumed by V2 spends; the
  // pre-H2 wasm build ignores the extra arguments. Marshalled the same way
  // as every other *Hex field in this API, via ccall's 'string' type.
  const extensionCommitmentHex = '';

  onProgress({ stage: 'prepare', done: totalSetCoins, total: totalSetCoins });
  onProgress({
    stage: 'prove',
    inputs: selectedSpendCoins.length,
    estimatedMs:
      (spendStats.proofMsPerInput ?? DEFAULT_PROOF_MS_PER_INPUT) *
      selectedSpendCoins.length,
  });
  const proveStart = performance.now();
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
      'number',
      'string',
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
      spendVersion,
      extensionCommitmentHex,
    ],
  );

  await saveSpendStats(db, {
    proofMsPerInput: Math.round(
      (performance.now() - proveStart) / selectedSpendCoins.length,
    ),
  });

  if (!result) {
    const hasUnselectedCoins = selectedSpendCoins.length < spendCoinList.length;
    cleanup();
    if (useFeeEstimate) {
      throw new FeeEstimateError('Stored fee estimate was too low.');
    }
    if (hasUnselectedCoins && !useAllCoins) {
      throw new SparkFeeShortfallError(
        'Selected Spark coins do not cover the amount and network fee.',
      );
    }
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

  const fee = Number(
    Module.ccall(
      'js_getCreateSparkSpendTxResultFee',
      'number',
      ['number'],
      [result],
    ),
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
    sparkTxType,
  });
  cleanup();
  if (!isSparkTransaction) {
    await saveSpendStats(db, {
      transparentFeePerInput: fee / selectedSpendCoins.length,
    });
  }
  return {
    hex: finalTx,
    selectedTags: selectedSpendCoins.map(coin => coin.tag),
    fee,
    recipientAmount:
      isSparkTransaction && feeFromAmount
        ? requestedAmount - fee
        : requestedAmount,
  };
}

const createSparkSpendWithFeeRetry = async (
  params: Omit<CreateSparkSpendParams, 'extraCoins'>,
): Promise<SendFromSparkAddressResult> => {
  for (let extraCoins = 0; ; extraCoins++) {
    try {
      return await createSparkSpend({ ...params, extraCoins });
    } catch (error) {
      if (
        !(error instanceof SparkFeeShortfallError) ||
        extraCoins >= MAX_EXTRA_COINS
      ) {
        throw error instanceof SparkFeeShortfallError
          ? new Error('Not enough Spark balance to cover the network fee.')
          : error;
      }
    }
  }
};

/** Builds the spend. Runs inside the spend worker; see sendFromSparkAddress. */
export async function buildSparkSpend(
  Module: WasmModule,
  { networkInfo, to, amount, isMax, isSparkTransaction }: BuildSparkSpendRequest,
  onProgress: (progress: SparkSpendProgress) => void,
): Promise<SendFromSparkAddressResult> {
  const requestedAmount = getRequestedAmount(amount);
  const baseParams = {
    Module,
    networkInfo,
    to,
    isSparkTransaction,
    onProgress,
  };

  if (isMax && !isSparkTransaction) {
    // The transparent output amount is signed before the fee is known, so the
    // fee cannot come from it. Reserve an estimate from earlier sends and let
    // the change output absorb the difference: one build instead of two.
    try {
      return await createSparkSpend({
        ...baseParams,
        requestedAmount,
        feeFromAmount: false,
        extraCoins: 0,
        useAllCoins: true,
        useFeeEstimate: true,
      });
    } catch (error) {
      if (!(error instanceof FeeEstimateError)) throw error;
    }

    // No usable estimate: build once to learn the fee, then build for real.
    const probe = await createSparkSpendWithFeeRetry({
      ...baseParams,
      requestedAmount:
        requestedAmount -
        Math.min(MAX_PROBE_RESERVE, Math.floor(requestedAmount / 2)),
      feeFromAmount: false,
      useAllCoins: true,
    });
    return createSparkSpendWithFeeRetry({
      ...baseParams,
      requestedAmount: requestedAmount - probe.fee - MAX_TRANSPARENT_MARGIN,
      feeFromAmount: false,
      useAllCoins: true,
    });
  }

  return createSparkSpendWithFeeRetry({
    ...baseParams,
    requestedAmount,
    feeFromAmount: isMax && isSparkTransaction,
    useAllCoins: false,
  });
}
