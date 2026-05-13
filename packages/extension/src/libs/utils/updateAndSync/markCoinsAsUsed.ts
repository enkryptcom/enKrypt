import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import {
  FullTransactionModel,
  MyCoinModel,
} from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { base64ToReversedHex } from '@/libs/spark-handler/utils';
import { firoElectrum } from '@/providers/bitcoin/libs/electrum-client/electrum-client';

export type SparkUnusedTxDetails = FullTransactionModel & { value: number };

const db = new IndexedDBHelper();

export const markCoinsAsUsed = async (
  onBalanceCalculated?: () => void,
): Promise<SparkUnusedTxDetails[]> => {
  let unusedTxDetails: SparkUnusedTxDetails[] = [];

  const usedCoinsTags = await db.readData<{
    tags: string[];
    txHashes: [string, string][];
  }>(DB_DATA_KEYS.usedCoinsTags);
  const coinsTagsSet = new Set(usedCoinsTags?.tags ?? []);

  const myCoins = await db.readData<MyCoinModel[]>(DB_DATA_KEYS.myCoins);

  if (!myCoins?.length || !usedCoinsTags?.tags?.length) {
    return [];
  }

  const txHashesMap = new Map(usedCoinsTags.txHashes || []);
  console.log('>>>>txHashesMap', txHashesMap);
  const updatedCoins = myCoins.map(coin => {
    if (!coinsTagsSet.has(coin.tag)) return coin;
    return {
      ...coin,
      isUsed: true,
      txHash: txHashesMap.get(coin.tag) || null,
    };
  });

  const unusedCoins = updatedCoins.filter(el => !el.isUsed);

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

    unusedTxDetails = txIdsDecoded
      .map((txId, index) => {
        const tx = results[txId];

        if (!tx) {
          console.warn(`Transaction details not found for txId: ${txId}`);
          return null;
        }

        const coin = unusedCoins[index];
        const coinValue = coin?.value;

        if (coinValue === undefined) {
          console.warn(
            `Coin value not found for txId: ${txId}, index: ${index}`,
          );

          return {
            ...tx,
            value: '0',
          };
        }

        return {
          ...tx,
          value: Number(coinValue),
        };
      })
      .filter((tx): tx is SparkUnusedTxDetails => tx !== null);
  }

  if (onBalanceCalculated) {
    try {
      onBalanceCalculated();
    } catch (err) {
      console.error('Error in onBalanceCalculated callback:', err);
    }
  }

  await Promise.all([db.saveData(DB_DATA_KEYS.myCoins, updatedCoins)]);

  return unusedTxDetails;
};
