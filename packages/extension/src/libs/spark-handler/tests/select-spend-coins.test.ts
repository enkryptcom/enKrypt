import { describe, it, expect } from 'vitest';
import {
  MAX_DUST_SWEEP_COINS,
  MIN_DUST_SWEEP_VALUE,
  selectSpendCoins,
  SpendCoin,
} from '../select-spend-coins';

const makeCoin = (tag: string, value: number, setId = 1): SpendCoin => ({
  coin: [tag],
  setId,
  metadata: 0,
  value,
  tag,
});

const defaultOptions = {
  needsFeeSlack: true,
  extraCoins: 0,
  useAllCoins: false,
  sweepDust: true,
};

const tagsOf = (coins: SpendCoin[]) => coins.map(coin => coin.tag);

describe('selectSpendCoins', () => {
  it('adds the smallest coins from the same set to a small send', () => {
    const coins = [
      makeCoin('big', 8_500_000),
      makeCoin('s1', 10_000),
      makeCoin('s2', 20_000),
      makeCoin('s3', 30_000),
      makeCoin('s4', 40_000),
      makeCoin('s5', 50_000),
    ];

    const selected = selectSpendCoins(coins, 5_000_000, defaultOptions);

    expect(tagsOf(selected)).toEqual(['big', 's1', 's2', 's3']);
  });

  it('skips coins below the minimum dust value', () => {
    const coins = [
      makeCoin('big', 8_500_000),
      makeCoin('tiny', MIN_DUST_SWEEP_VALUE - 1),
      makeCoin('s1', MIN_DUST_SWEEP_VALUE),
    ];

    const selected = selectSpendCoins(coins, 5_000_000, defaultOptions);

    expect(tagsOf(selected)).toEqual(['big', 's1']);
  });

  it('skips coins from sets the send does not already use', () => {
    const coins = [
      makeCoin('big', 8_500_000, 2),
      makeCoin('old', 10_000, 1),
      makeCoin('same', 20_000, 2),
    ];

    const selected = selectSpendCoins(coins, 5_000_000, defaultOptions);

    expect(tagsOf(selected)).toEqual(['big', 'same']);
  });

  it('adds no dust when the send already needs many coins', () => {
    const coins = [
      makeCoin('c1', 1_000_000),
      makeCoin('c2', 1_000_000),
      makeCoin('c3', 1_000_000),
      makeCoin('c4', 1_000_000),
      makeCoin('s1', 10_000),
      makeCoin('s2', 20_000),
    ];

    const selected = selectSpendCoins(coins, 3_500_000, defaultOptions);

    expect(tagsOf(selected)).toEqual(['c1', 'c2', 'c3', 'c4']);
  });

  it('keeps the old behaviour when sweepDust is off', () => {
    const coins = [
      makeCoin('big', 8_500_000),
      makeCoin('s1', 10_000),
      makeCoin('s2', 20_000),
    ];

    const selected = selectSpendCoins(coins, 5_000_000, {
      ...defaultOptions,
      sweepDust: false,
    });

    expect(tagsOf(selected)).toEqual(['big']);
  });

  it('returns every coin when useAllCoins is set', () => {
    const coins = [
      makeCoin('s1', 10_000),
      makeCoin('big', 8_500_000),
      makeCoin('s2', 20_000),
    ];

    const selected = selectSpendCoins(coins, 5_000_000, {
      ...defaultOptions,
      useAllCoins: true,
    });

    expect(tagsOf(selected)).toEqual(['big', 's2', 's1']);
  });

  it('never picks a coin twice when extra coins and dust overlap', () => {
    const coins = [
      makeCoin('big', 8_500_000),
      makeCoin('mid', 100_000),
      makeCoin('s1', 10_000),
      makeCoin('s2', 20_000),
    ];

    const selected = selectSpendCoins(coins, 5_000_000, {
      ...defaultOptions,
      extraCoins: 2,
    });
    const tags = tagsOf(selected);

    expect(new Set(tags).size).toBe(tags.length);
    expect(tags).toEqual(['big', 'mid', 's2', 's1']);
  });

  it('caps the number of dust coins', () => {
    const coins = [
      makeCoin('big', 8_500_000),
      ...Array.from({ length: 10 }, (_, index) =>
        makeCoin(`s${index}`, 10_000 + index),
      ),
    ];

    const selected = selectSpendCoins(coins, 5_000_000, defaultOptions);

    expect(selected).toHaveLength(1 + MAX_DUST_SWEEP_COINS);
  });

  it('handles wallets with one or two coins', () => {
    expect(
      tagsOf(
        selectSpendCoins([makeCoin('only', 100_000)], 50_000, defaultOptions),
      ),
    ).toEqual(['only']);

    const twoCoins = selectSpendCoins(
      [makeCoin('a', 100_000), makeCoin('b', 50_000)],
      50_000,
      defaultOptions,
    );
    expect(tagsOf(twoCoins)).toEqual(['a', 'b']);
  });

  it('adds nothing when the wallet has no coins', () => {
    expect(selectSpendCoins([], 50_000, defaultOptions)).toEqual([]);
  });
});
