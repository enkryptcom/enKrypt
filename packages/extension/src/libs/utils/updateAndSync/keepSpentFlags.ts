import { MyCoinModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';
import { SyncedSparkCoin } from '@/libs/utils/updateAndSync/markCoinsAsUsed';

export const keepSpentFlags = (
  savedCoins: SyncedSparkCoin[],
  rescannedCoins: MyCoinModel[],
): SyncedSparkCoin[] => {
  if (!savedCoins.length) return rescannedCoins;

  const spentByTag = new Map(
    savedCoins.filter(coin => coin.isUsed).map(coin => [coin.tag, coin]),
  );

  // A rescan reads isUsed from the set metadata, which lags behind the spends
  // markCoinsAsUsed already found; keep those instead of resetting them.
  return rescannedCoins.map(coin => {
    const saved = spentByTag.get(coin.tag);
    if (!saved) return coin;
    return { ...coin, isUsed: true, txHash: saved.txHash ?? null };
  });
};
