import { describe, it, expect, vi, beforeEach } from 'vitest';

const { areas, multiGetTransactionByTxid } = vi.hoisted(() => ({
  areas: new Map<string, Map<string, unknown>>(),
  multiGetTransactionByTxid: vi.fn(),
}));

vi.mock('@/types/provider', () => ({
  InternalStorageNamespace: {
    activityState: 'ActivityState',
    sparkActivityState: 'SparkActivityState',
  },
}));

vi.mock('@/providers/bitcoin/libs/electrum-client/electrum-client', () => ({
  firoElectrum: { multiGetTransactionByTxid },
}));

vi.mock('@/libs/common/browser-storage', async () => {
  const { Storage } = await import('@enkryptcom/storage');
  const tick = () => new Promise(resolve => setTimeout(resolve, 1));
  const clone = <T>(value: T): T =>
    value === undefined ? value : JSON.parse(JSON.stringify(value));
  class MemoryArea {
    constructor(private name: string) {}
    // The rebuild keeps one store for the whole module, so recreate the
    // area after a test clears it.
    private get items() {
      if (!areas.has(this.name)) areas.set(this.name, new Map());
      return areas.get(this.name)!;
    }
    async get(key: string) {
      await tick();
      const item = this.items.get(key);
      return item === undefined ? {} : { [key]: clone(item) };
    }
    async set(values: Record<string, unknown>) {
      await tick();
      Object.entries(values).forEach(([key, value]) =>
        this.items.set(key, clone(value)),
      );
    }
    async remove(key: string) {
      this.items.delete(key);
    }
    async clear() {
      this.items.clear();
    }
  }
  class BrowserStorage extends Storage {
    constructor(namespace: string) {
      super(namespace, { storage: new MemoryArea(namespace) as any });
    }
  }
  return { default: BrowserStorage };
});

import {
  buildSparkActivity,
  classifySparkHistory,
  rebuildSparkHistory,
} from '../updateAndSync/rebuildSparkHistory';
import SparkHistoryState from '../spark-history-state';
import { getSparkHistoryOptions } from '../spark-history';
import { SyncedSparkCoin } from '../updateAndSync/markCoinsAsUsed';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import { BaseNetwork } from '@/types/base-network';

const network = {
  name: 'Firo',
  decimals: 8,
  icon: 'firo.svg',
  currencyName: 'FIRO',
} as unknown as BaseNetwork;
const SPARK_ADDRESS = 'sm1myaddress';
const sparkOptions = getSparkHistoryOptions('Firo');

const txid = (n: number) => n.toString(16).padStart(64, '0');
// The server sends tx ids as base64 of the reversed bytes.
const toServerId = (hex: string) =>
  Buffer.from(hex, 'hex').reverse().toString('base64');

const makeCoin = (
  value: number,
  createdTx: string,
  spentTx?: string,
): SyncedSparkCoin =>
  ({
    coin: ['serialized', toServerId(createdTx)],
    value,
    tag: `tag-${createdTx}-${value}`,
    isUsed: !!spentTx,
    txHash: spentTx ? toServerId(spentTx) : null,
    setId: 1,
    setHash: 'hash',
  }) as unknown as SyncedSparkCoin;

const makeTx = (overrides: Record<string, unknown> = {}) =>
  ({
    time: 1_700_000_000,
    height: 100,
    vin: [],
    vout: [],
    ...overrides,
  }) as any;

const sparkSpend = (nFees?: number) =>
  makeTx({
    vin: [{ nFees, lTags: [] }],
    vout: [{ value: 0, scriptPubKey: { type: 'sparksmint' } }],
  });

const findEntry = (coins: SyncedSparkCoin[], hash: string) =>
  classifySparkHistory(coins).find(entry => entry.txid === hash)!;

describe('classifySparkHistory', () => {
  it('finds a send and subtracts its change', () => {
    const coins = [makeCoin(1000, txid(1), txid(2)), makeCoin(300, txid(2))];
    const send = findEntry(coins, txid(2));
    expect(send.isIncoming).toBe(false);
    expect(send.spent.toFixed()).toBe('1000');
    expect(send.created.toFixed()).toBe('300');
  });

  it('keeps a receive that was later spent', () => {
    const coins = [makeCoin(1000, txid(1), txid(2))];
    const receive = findEntry(coins, txid(1));
    expect(receive.isIncoming).toBe(true);
    expect(receive.created.toFixed()).toBe('1000');
  });

  it('adds up several coins of one tx', () => {
    const coins = [
      makeCoin(100, txid(1), txid(3)),
      makeCoin(200, txid(1), txid(3)),
    ];
    expect(findEntry(coins, txid(1)).created.toFixed()).toBe('300');
    expect(findEntry(coins, txid(3)).spent.toFixed()).toBe('300');
  });

  it('skips only the coin whose tx id does not decode', () => {
    const bad = {
      ...makeCoin(999, txid(9)),
      coin: ['serialized', '%%%'],
    } as SyncedSparkCoin;
    const entries = classifySparkHistory([bad, makeCoin(500, txid(1))]);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.txid).toBe(txid(1));
    expect(entries[0]?.created.toFixed()).toBe('500');
  });

  it('does not count a used coin without a spending tx as a send', () => {
    const coin = { ...makeCoin(500, txid(1)), isUsed: true, txHash: null };
    const entries = classifySparkHistory([coin as SyncedSparkCoin]);
    expect(entries.map(entry => entry.isIncoming)).toEqual([true]);
  });

  it('returns nothing for no coins', () => {
    expect(classifySparkHistory([])).toEqual([]);
  });
});

describe('buildSparkActivity', () => {
  it('shows a Spark send amount without change and fee', () => {
    const coins = [
      makeCoin(100_000, txid(1), txid(2)),
      makeCoin(30_000, txid(2)),
    ];
    const row = buildSparkActivity(
      findEntry(coins, txid(2)),
      sparkSpend(0.00009428),
      network,
      SPARK_ADDRESS,
    );
    expect(row).toMatchObject({
      type: ActivityType.transaction,
      isIncoming: false,
      from: SPARK_ADDRESS,
      to: 'Hidden',
      value: String(100_000 - 30_000 - 9428),
      status: ActivityStatus.success,
      timestamp: 1_700_000_000_000,
      transactionHash: txid(2),
    });
  });

  it('includes the fee when the tx has no fee field', () => {
    const coins = [makeCoin(100_000, txid(1), txid(2))];
    const row = buildSparkActivity(
      findEntry(coins, txid(2)),
      sparkSpend(),
      network,
      SPARK_ADDRESS,
    );
    expect(row.value).toBe('100000');
  });

  it('uses the exact transparent output for a Spark to transparent send', () => {
    const coins = [
      makeCoin(40_000_000_000, txid(1), txid(2)),
      makeCoin(4_999_996_885, txid(2)),
    ];
    const tx = makeTx({
      vin: [{ nFees: 0.00003115, lTags: [] }],
      vout: [
        {
          value: 350,
          scriptPubKey: {
            type: 'pubkeyhash',
            addresses: ['aLw4YetKZKD9DyifqNR1uqrK8nta6czQsT'],
          },
        },
        { value: 0, scriptPubKey: { type: 'sparksmint' } },
      ],
    });
    const row = buildSparkActivity(
      findEntry(coins, txid(2)),
      tx,
      network,
      SPARK_ADDRESS,
    );
    expect(row.to).toBe('aLw4YetKZKD9DyifqNR1uqrK8nta6czQsT');
    expect(row.value).toBe('35000000000');
  });

  it('shows the fee for a send to this wallet own Spark address', () => {
    const coins = [
      makeCoin(100_000, txid(1), txid(2)),
      makeCoin(60_000, txid(2)),
      makeCoin(30_000, txid(2)),
    ];
    // 100000 - 90000 = 10000 left, but the tx reports a larger fee field.
    const row = buildSparkActivity(
      findEntry(coins, txid(2)),
      sparkSpend(0.0001),
      network,
      SPARK_ADDRESS,
    );
    expect(row.value).toBe('10000');
  });

  it('shows a receive as incoming', () => {
    const row = buildSparkActivity(
      findEntry([makeCoin(5000, txid(1))], txid(1)),
      makeTx(),
      network,
      SPARK_ADDRESS,
    );
    expect(row).toMatchObject({
      isIncoming: true,
      from: 'Hidden',
      to: SPARK_ADDRESS,
      value: '5000',
    });
  });

  it('shows the transparent sender of a mint', () => {
    const row = buildSparkActivity(
      findEntry([makeCoin(5000, txid(1))], txid(1)),
      makeTx({ vin: [{ address: 'aSender', value: 1 }] }),
      network,
      SPARK_ADDRESS,
    );
    expect(row.from).toBe('aSender');
  });

  it('marks an unconfirmed tx as pending', () => {
    const row = buildSparkActivity(
      findEntry([makeCoin(5000, txid(1))], txid(1)),
      makeTx({ height: 0, time: undefined }),
      network,
      SPARK_ADDRESS,
    );
    expect(row.status).toBe(ActivityStatus.pending);
    expect(row.timestamp).toBeGreaterThan(0);
  });
});

describe('rebuildSparkHistory', () => {
  const coins = [
    makeCoin(100_000, txid(1), txid(2)),
    makeCoin(30_000, txid(2)),
  ];

  beforeEach(() => {
    areas.clear();
    multiGetTransactionByTxid.mockReset();
    multiGetTransactionByTxid.mockImplementation(async (ids: string[]) =>
      Object.fromEntries(
        ids.map(id => [id, id === txid(2) ? sparkSpend(0.0001) : makeTx()]),
      ),
    );
  });

  const getRows = () => new SparkHistoryState().getAllActivities(sparkOptions);

  it('brings back sends and receives after a reinstall', async () => {
    await rebuildSparkHistory({ coins, network, sparkAddress: SPARK_ADDRESS });

    const rows = await getRows();
    expect(rows.map(row => [row.transactionHash, row.isIncoming])).toEqual(
      expect.arrayContaining([
        [txid(1), true],
        [txid(2), false],
      ]),
    );
    expect(rows).toHaveLength(2);
  });

  it('does not fetch again when nothing changed', async () => {
    await rebuildSparkHistory({ coins, network, sparkAddress: SPARK_ADDRESS });
    multiGetTransactionByTxid.mockClear();

    await rebuildSparkHistory({ coins, network, sparkAddress: SPARK_ADDRESS });

    expect(multiGetTransactionByTxid).not.toHaveBeenCalled();
    expect(await getRows()).toHaveLength(2);
  });

  it('fixes a send amount when its change shows up later', async () => {
    await rebuildSparkHistory({
      coins: [coins[0]!],
      network,
      sparkAddress: SPARK_ADDRESS,
    });
    await rebuildSparkHistory({ coins, network, sparkAddress: SPARK_ADDRESS });

    const send = (await getRows()).find(row => row.transactionHash === txid(2));
    expect(send?.value).toBe(String(100_000 - 30_000 - 10_000));
  });

  it('keeps the recipient the send page saved', async () => {
    await new SparkHistoryState().addActivities(
      [
        {
          network: 'Firo',
          from: SPARK_ADDRESS,
          to: 'sm1recipient',
          isIncoming: false,
          status: ActivityStatus.pending,
          timestamp: 1,
          type: ActivityType.transaction,
          value: '60000',
          transactionHash: txid(2),
          token: { decimals: 8, icon: '', name: 'FIRO', symbol: 'FIRO' },
        } as Activity,
      ],
      sparkOptions,
    );

    await rebuildSparkHistory({ coins, network, sparkAddress: SPARK_ADDRESS });

    const send = (await getRows()).find(row => row.transactionHash === txid(2));
    expect(send).toMatchObject({
      to: 'sm1recipient',
      value: '60000',
      status: ActivityStatus.success,
    });
  });

  it('saves nothing when fetching the txs fails', async () => {
    multiGetTransactionByTxid.mockRejectedValue(new Error('offline'));

    await rebuildSparkHistory({ coins, network, sparkAddress: SPARK_ADDRESS });

    expect(await getRows()).toEqual([]);
  });

  it('still saves the others when the server does not know one tx', async () => {
    multiGetTransactionByTxid.mockImplementation(async (ids: string[]) => {
      if (ids.includes(txid(2))) throw new Error('unknown tx');
      return Object.fromEntries(ids.map(id => [id, makeTx()]));
    });

    await rebuildSparkHistory({ coins, network, sparkAddress: SPARK_ADDRESS });

    expect((await getRows()).map(row => row.transactionHash)).toEqual([
      txid(1),
    ]);
  });

  it('does not fetch rows pushed out by the 500 entry limit again', async () => {
    const many = Array.from({ length: 502 }, (_, idx) =>
      makeCoin(1000, txid(idx + 1)),
    );
    multiGetTransactionByTxid.mockImplementation(async (ids: string[]) =>
      Object.fromEntries(
        ids.map(id => [id, makeTx({ time: parseInt(id, 16) })]),
      ),
    );
    await rebuildSparkHistory({
      coins: many,
      network,
      sparkAddress: SPARK_ADDRESS,
    });
    expect(await getRows()).toHaveLength(500);
    multiGetTransactionByTxid.mockClear();

    await rebuildSparkHistory({
      coins: many,
      network,
      sparkAddress: SPARK_ADDRESS,
    });

    expect(multiGetTransactionByTxid).not.toHaveBeenCalled();
  });
});
