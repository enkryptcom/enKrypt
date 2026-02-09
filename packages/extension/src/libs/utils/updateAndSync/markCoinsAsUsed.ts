import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import {
  FullTransactionModel,
  MyCoinModel,
} from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { intersectSets } from '@action/utils/set-utils';
import { base64ToReversedHex } from '@/libs/spark-handler/utils';
import { firoElectrum } from '@/providers/bitcoin/libs/electrum-client/electrum-client';
import BigNumber from 'bignumber.js';

const db = new IndexedDBHelper();

export const markCoinsAsUsed = async (
  onBalanceCalculated?: (balance: string) => void,
): Promise<FullTransactionModel[]> => {
  let unusedTxDetails: FullTransactionModel[] = [];

  const usedCoinsTags = await db.readData<{
    tags: string[];
    txHashes: [string, string][];
  }>(DB_DATA_KEYS.usedCoinsTags);
  const coinsTagsSet = new Set(usedCoinsTags?.tags ?? []);

  const myCoins = await db.readData<MyCoinModel[]>(DB_DATA_KEYS.myCoins);
  const myCoinsTagsSet = new Set((myCoins ?? []).map(coin => coin.tag));

  if (!myCoins?.length || !usedCoinsTags?.tags?.length) {
    return [];
  }

  console.log('>>>>coinsTagsSet', coinsTagsSet);
  console.log('>>>>myCoinsTagsSet', myCoinsTagsSet);

  const usedMyCoinsTagsSet = intersectSets(coinsTagsSet, myCoinsTagsSet);

  console.log('>>>>intersection usedMyCoinsTagsSet', usedMyCoinsTagsSet);

  if (usedMyCoinsTagsSet.size === 0) {
    return [];
  }

  const txHashesMap = new Map(usedCoinsTags.txHashes || []);
  console.log('>>>>txHashesMap', txHashesMap);
  const updatedCoins = myCoins.map(coin => {
    if (!usedMyCoinsTagsSet.has(coin.tag)) return coin;
    return {
      ...coin,
      isUsed: true,
      txHash: txHashesMap.get(coin.tag) || null,
    };
  });

  const unusedCoins = updatedCoins.filter(el => !el.isUsed);

  console.log('>>>>>> unusedCoins', unusedCoins);

  const balance = unusedCoins.reduce((a: bigint, c) => a + c.value, 0n);

  const mintIds = unusedCoins.map(unusedCoin => unusedCoin.coin[1]);

  const txIdsDecoded = mintIds
    .map(base64 => {
      try {
        return base64ToReversedHex(base64);
      } catch {
        return '';
      }
    })
    .filter(Boolean);

  console.log('===>>>Unused Spark Coins TX IDs:', txIdsDecoded);

  if (!!txIdsDecoded?.length) {
    const results = await firoElectrum.multiGetTransactionByTxid(txIdsDecoded);

    unusedTxDetails = Object.values(results);
  }

  console.log('===>>>Spark Unused TX Details:', unusedTxDetails);

  const sparkBalance = new BigNumber(balance.toString()).toString();

  if (onBalanceCalculated) {
    try {
      onBalanceCalculated(sparkBalance);
    } catch (err) {
      console.error('Error in onBalanceCalculated callback:', err);
    }
  }

  await Promise.all([
    db.saveData(DB_DATA_KEYS.myCoins, updatedCoins),
    db.saveData(DB_DATA_KEYS.sparkBalance, sparkBalance),
  ]);

  return unusedTxDetails;
};
