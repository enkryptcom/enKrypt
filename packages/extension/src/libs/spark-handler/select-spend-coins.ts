export type SpendCoin = {
  coin: string[];
  setId: number;
  metadata: number;
  value: number;
  tag: string;
};

export const MAX_DUST_SWEEP_COINS = 3;
export const MAX_COINS_FOR_DUST_SWEEP = 3;
export const MIN_DUST_SWEEP_VALUE = 5_000;

type SelectSpendCoinsOptions = {
  needsFeeSlack: boolean;
  extraCoins: number;
  useAllCoins: boolean;
  sweepDust: boolean;
};

export const selectSpendCoins = (
  spendCoinList: SpendCoin[],
  requestedAmount: number,
  {
    needsFeeSlack,
    extraCoins,
    useAllCoins,
    sweepDust,
  }: SelectSpendCoinsOptions,
): SpendCoin[] => {
  const sortedCoins = [...spendCoinList].sort(
    (leftCoin, rightCoin) => rightCoin.value - leftCoin.value,
  );
  if (useAllCoins) return sortedCoins;

  const largestCoins: SpendCoin[] = [];
  let selectedAmount = 0;
  for (const spendCoin of sortedCoins) {
    const isCovered = needsFeeSlack
      ? selectedAmount > requestedAmount
      : selectedAmount >= requestedAmount;
    if (isCovered) break;
    largestCoins.push(spendCoin);
    selectedAmount += spendCoin.value;
  }

  const selectedCoins = largestCoins.concat(
    sortedCoins.slice(largestCoins.length, largestCoins.length + extraCoins),
  );

  if (!sweepDust || largestCoins.length > MAX_COINS_FOR_DUST_SWEEP) {
    return selectedCoins;
  }

  const selectedTags = new Set(selectedCoins.map(coin => coin.tag));
  const selectedSetIds = new Set(selectedCoins.map(coin => coin.setId));
  const dustCoins = [...sortedCoins]
    .reverse()
    .filter(
      coin =>
        !selectedTags.has(coin.tag) &&
        coin.value >= MIN_DUST_SWEEP_VALUE &&
        selectedSetIds.has(coin.setId),
    )
    .slice(0, MAX_DUST_SWEEP_COINS);

  return selectedCoins.concat(dustCoins);
};
