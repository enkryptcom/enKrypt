import { DB_DATA_KEYS, IndexedDBHelper } from '@action/db/indexedDB';
import { MyCoinModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import BigNumber from 'bignumber.js';

const db = new IndexedDBHelper();

export const calculateCurrentSparkBalance = async () => {
  const myCoins = await db.readData<MyCoinModel[]>(DB_DATA_KEYS.myCoins);

  if (!myCoins?.length) {
    return '0';
  }

  const unusedCoins = myCoins.filter(el => !el.isUsed);
  const balance = unusedCoins.reduce((a: bigint, c) => a + c.value, 0n);

  return new BigNumber(balance.toString()).toString();
};
