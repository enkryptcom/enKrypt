import { MyCoinModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';

export interface OwnedCoinData {
  coin: string[];
  setId: number;
  isUsed: boolean;
  setHash: string;
  tag: string;
  value: bigint;
}

export const removeDuplicates = (
  coinsResult: Set<MyCoinModel>,
): Set<MyCoinModel> => {
  const arr = Array.from(coinsResult);
  const seen = new Set<string>();
  const deduped = [];

  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i];
    const key = `${item.tag}:${item.coin.join('|')}`;

    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  return new Set(deduped.reverse());
};
