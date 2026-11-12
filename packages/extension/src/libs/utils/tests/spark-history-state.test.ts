import { describe, it, expect, vi, beforeEach } from 'vitest';

const { areas } = vi.hoisted(() => ({
  areas: new Map<string, Map<string, unknown>>(),
}));

vi.mock('@/types/provider', () => ({
  InternalStorageNamespace: {
    activityState: 'ActivityState',
    sparkActivityState: 'SparkActivityState',
  },
}));

vi.mock('@/libs/common/browser-storage', async () => {
  const { Storage } = await import('@enkryptcom/storage');
  const tick = () => new Promise(resolve => setTimeout(resolve, 1));
  const clone = <T>(value: T): T =>
    value === undefined ? value : JSON.parse(JSON.stringify(value));
  class MemoryArea {
    constructor(private name: string) {
      if (!areas.has(name)) areas.set(name, new Map());
    }
    private get items() {
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

import SparkHistoryState from '../spark-history-state';
import { Activity } from '@/types/activity';
import { getSparkHistoryOptions } from '../spark-history';

const sparkOptions = getSparkHistoryOptions('Firo');

const makeActivity = (
  hash: string,
  timestamp = Date.now(),
  status = 'pending',
): Activity =>
  ({
    from: 'from',
    to: 'to',
    isIncoming: false,
    network: 'Firo',
    status,
    timestamp,
    type: 'transaction',
    value: '1',
    transactionHash: hash,
    token: { decimals: 8, icon: '', name: 'Firo', symbol: 'FIRO' },
  }) as unknown as Activity;

const hashes = (list: Activity[]) => list.map(act => act.transactionHash);

const namespaceKeys = (namespace: string) =>
  Object.keys(
    (areas.get(namespace)?.get(namespace) as Record<string, unknown>) ?? {},
  );

const saveLegacy = (id: string, activities: Activity[]) => {
  areas.set(
    'ActivityState',
    new Map([['ActivityState', { [id]: { activity: activities } }]]),
  );
};

describe('SparkHistoryState', () => {
  beforeEach(() => {
    areas.clear();
  });

  it('saves Spark history in its own storage', async () => {
    const state = new SparkHistoryState();
    await state.addActivities([makeActivity('spark-1')], sparkOptions);

    expect(hashes(await state.getAllActivities(sparkOptions))).toEqual([
      'spark-1',
    ]);
    expect(namespaceKeys('SparkActivityState')).toEqual([
      state.getActivityId(sparkOptions),
    ]);
    expect(namespaceKeys('ActivityState')).toEqual([]);
  });

  it('does not lose entries saved at the same time', async () => {
    await Promise.all([
      new SparkHistoryState().addActivities(
        [makeActivity('send', 3000)],
        sparkOptions,
      ),
      new SparkHistoryState().addActivities(
        [makeActivity('sync-1', 2000), makeActivity('sync-2', 1000)],
        sparkOptions,
      ),
      new SparkHistoryState().updateActivity(
        makeActivity('send', 3000, 'success'),
        sparkOptions,
      ),
    ]);

    const list = await new SparkHistoryState().getAllActivities(sparkOptions);
    expect(hashes(list)).toEqual(['send', 'sync-1', 'sync-2']);
    expect(list[0]?.status).toBe('success');
  });

  it('keeps the saved entry and updates only its status', async () => {
    const state = new SparkHistoryState();
    await state.addActivities([makeActivity('send', 1000)], sparkOptions);
    await state.addActivities(
      [{ ...makeActivity('send', 5000, 'success'), to: 'Hidden' } as Activity],
      sparkOptions,
    );

    const [entry] = await state.getAllActivities(sparkOptions);
    expect(entry?.to).toBe('to');
    expect(entry?.timestamp).toBe(1000);
    expect(entry?.status).toBe('success');
  });

  it('keeps pending entries older than 12 hours', async () => {
    const state = new SparkHistoryState();
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    await state.addActivities([makeActivity('old', dayAgo)], sparkOptions);
    await state.addActivities([makeActivity('new')], sparkOptions);

    expect(hashes(await state.getAllActivities(sparkOptions))).toEqual([
      'new',
      'old',
    ]);
  });

  it('keeps only the newest 500 entries', async () => {
    const state = new SparkHistoryState();
    const many = Array.from({ length: 505 }, (_, idx) =>
      makeActivity(`tx-${idx}`, idx),
    );
    await state.addActivities(many, sparkOptions);

    const list = await state.getAllActivities(sparkOptions);
    expect(list).toHaveLength(500);
    expect(list[0]?.transactionHash).toBe('tx-504');
    expect(list[499]?.transactionHash).toBe('tx-5');
  });

  it('reads Spark history saved in the old shared storage', async () => {
    const state = new SparkHistoryState();
    const id = state.getActivityId(sparkOptions);
    saveLegacy(id, [makeActivity('old-spark', 1000)]);

    expect(hashes(await state.getAllActivities(sparkOptions))).toEqual([
      'old-spark',
    ]);

    await state.addActivities([makeActivity('new-spark', 2000)], sparkOptions);

    expect(hashes(await state.getAllActivities(sparkOptions))).toEqual([
      'new-spark',
      'old-spark',
    ]);
    expect(namespaceKeys('SparkActivityState')).toEqual([id]);
    expect(namespaceKeys('ActivityState')).toEqual([id]);
  });

  describe('upsertSyncedActivities', () => {
    const synced = (hash: string, value: string, timestamp = 1000) =>
      ({
        ...makeActivity(hash, timestamp, 'success'),
        to: 'Hidden',
        value,
      }) as Activity;

    it('keeps a send page entry and updates only its status', async () => {
      const state = new SparkHistoryState();
      await state.addActivities([makeActivity('send', 1000)], sparkOptions);

      await state.upsertSyncedActivities(
        [synced('send', '999', 5000)],
        { send: 'sig' },
        sparkOptions,
      );

      const [entry] = await state.getAllActivities(sparkOptions);
      expect(entry).toMatchObject({
        to: 'to',
        value: '1',
        timestamp: 1000,
        status: 'success',
      });
      expect(await state.getSyncedSignatures(sparkOptions)).toEqual({});
    });

    it('replaces an entry made by the old sync', async () => {
      const state = new SparkHistoryState();
      await state.addActivities(
        [{ ...makeActivity('old'), type: 'spark_transaction' } as Activity],
        sparkOptions,
      );

      await state.upsertSyncedActivities(
        [synced('old', '42')],
        { old: 'sig' },
        sparkOptions,
      );

      const [entry] = await state.getAllActivities(sparkOptions);
      expect(entry).toMatchObject({ type: 'transaction', value: '42' });
      expect(await state.getSyncedSignatures(sparkOptions)).toEqual({
        old: 'sig',
      });
    });

    it('replaces an entry it rebuilt before', async () => {
      const state = new SparkHistoryState();
      await state.upsertSyncedActivities(
        [synced('tx', '1')],
        { tx: 'a' },
        sparkOptions,
      );
      await state.upsertSyncedActivities(
        [synced('tx', '2')],
        { tx: 'b' },
        sparkOptions,
      );

      const list = await state.getAllActivities(sparkOptions);
      expect(list).toHaveLength(1);
      expect(list[0]?.value).toBe('2');
      expect(await state.getSyncedSignatures(sparkOptions)).toEqual({
        tx: 'b',
      });
    });

    it('changes nothing when run twice', async () => {
      const state = new SparkHistoryState();
      const rows = [synced('a', '1', 2000), synced('b', '2', 1000)];
      await state.upsertSyncedActivities(
        rows,
        { a: '1', b: '2' },
        sparkOptions,
      );
      const first = await state.getAllActivities(sparkOptions);

      await state.upsertSyncedActivities(
        rows,
        { a: '1', b: '2' },
        sparkOptions,
      );

      expect(await state.getAllActivities(sparkOptions)).toEqual(first);
    });

    it('does not lose a send saved at the same time', async () => {
      await Promise.all([
        new SparkHistoryState().upsertSyncedActivities(
          [synced('sync', '1', 1000)],
          { sync: 's' },
          sparkOptions,
        ),
        new SparkHistoryState().addActivities(
          [makeActivity('send', 2000)],
          sparkOptions,
        ),
      ]);

      expect(
        hashes(await new SparkHistoryState().getAllActivities(sparkOptions)),
      ).toEqual(['send', 'sync']);
    });

    it('keeps the newest 500 entries and remembers the dropped ones', async () => {
      const state = new SparkHistoryState();
      const many = Array.from({ length: 502 }, (_, idx) =>
        synced(`tx-${idx}`, '1', idx),
      );
      const signatures = Object.fromEntries(
        many.map(act => [act.transactionHash, 'sig']),
      );
      await state.upsertSyncedActivities(many, signatures, sparkOptions);

      expect(await state.getAllActivities(sparkOptions)).toHaveLength(500);
      const kept = await state.getSyncedSignatures(sparkOptions);
      expect(Object.keys(kept)).toHaveLength(502);
      expect(kept['tx-0']).toBe('sig');
    });

    it('keeps synced ids when other writes save the list', async () => {
      const state = new SparkHistoryState();
      await state.upsertSyncedActivities(
        [synced('tx', '1')],
        { tx: 'sig' },
        sparkOptions,
      );

      await state.addActivities([makeActivity('send', 3000)], sparkOptions);
      await state.updateActivity(
        { ...synced('tx', '1'), status: 'pending' } as Activity,
        sparkOptions,
      );

      expect(await state.getSyncedSignatures(sparkOptions)).toEqual({
        tx: 'sig',
      });
    });
  });

  it('updates an entry copied from the old shared storage', async () => {
    const state = new SparkHistoryState();
    saveLegacy(state.getActivityId(sparkOptions), [
      makeActivity('old-spark', 1000),
    ]);

    await state.updateActivity(
      makeActivity('old-spark', 1000, 'success'),
      sparkOptions,
    );

    const [entry] = await state.getAllActivities(sparkOptions);
    expect(entry?.status).toBe('success');
  });
});
