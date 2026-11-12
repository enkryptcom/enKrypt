import { describe, it, expect } from 'vitest';
import { keepSpentFlags } from '../updateAndSync/keepSpentFlags';
import { SyncedSparkCoin } from '../updateAndSync/markCoinsAsUsed';
import { MyCoinModel } from '@/providers/bitcoin/libs/electrum-client/abstract-electrum';

const makeCoin = (
  tag: string,
  isUsed: boolean,
  txHash?: string | null,
): SyncedSparkCoin =>
  ({
    coin: [`serialized-${tag}`, `mint-${tag}`],
    setId: 11,
    setHash: 'set-hash',
    value: 1000,
    tag,
    isUsed,
    ...(txHash !== undefined ? { txHash } : {}),
  }) as unknown as SyncedSparkCoin;

const rescan = (tag: string, isUsed = false): MyCoinModel =>
  makeCoin(tag, isUsed) as MyCoinModel;

describe('keepSpentFlags', () => {
  it('keeps a spent coin spent when the rescan says unspent', () => {
    const [coin] = keepSpentFlags(
      [makeCoin('a', true, 'spend-tx')],
      [rescan('a')],
    );
    expect(coin).toMatchObject({ tag: 'a', isUsed: true, txHash: 'spend-tx' });
  });

  it('leaves an unspent coin unspent', () => {
    const [coin] = keepSpentFlags([makeCoin('a', false)], [rescan('a')]);
    expect(coin?.isUsed).toBe(false);
  });

  it('keeps a coin the rescan reports as used', () => {
    const [coin] = keepSpentFlags([makeCoin('a', false)], [rescan('a', true)]);
    expect(coin?.isUsed).toBe(true);
  });

  it('leaves a coin that was not saved before as it is', () => {
    const fresh = rescan('new');
    const [coin] = keepSpentFlags([makeCoin('a', true, 'spend-tx')], [fresh]);
    expect(coin).toBe(fresh);
  });

  it('returns the rescan as it is when nothing was saved', () => {
    const rescanned = [rescan('a'), rescan('b')];
    expect(keepSpentFlags([], rescanned)).toBe(rescanned);
  });

  it('keeps the order and length of the rescan', () => {
    const result = keepSpentFlags(
      [makeCoin('b', true, 'spend-b')],
      [rescan('a'), rescan('b'), rescan('c')],
    );
    expect(result.map(coin => [coin.tag, coin.isUsed])).toEqual([
      ['a', false],
      ['b', true],
      ['c', false],
    ]);
  });

  it('does not change the saved coins', () => {
    const saved = [makeCoin('a', true, 'spend-tx')];
    const rescanned = [rescan('a')];
    keepSpentFlags(saved, rescanned);
    expect(rescanned[0]?.isUsed).toBe(false);
    expect(saved[0]?.isUsed).toBe(true);
  });
});
