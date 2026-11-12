import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick, ref } from 'vue';
import { NetworkNames } from '@enkryptcom/types';

const { getAllActivities } = vi.hoisted(() => ({
  getAllActivities: vi.fn(),
}));

vi.mock('@/libs/utils/spark-history-state', () => ({
  default: class {
    getAllActivities = getAllActivities;
  },
}));

import { useMergeSparkHistory } from '../merge-spark-history';
import { getSparkHistoryOptions } from '@/libs/utils/spark-history';
import { Activity } from '@/types/activity';

const shownRow = {
  transactionHash: 'tx',
  status: 'success',
  value: '1',
  type: 'spark_transaction',
  isIncoming: false,
  to: 'Hidden',
  timestamp: 1,
} as unknown as Activity;

const settle = async () => {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 0));
};

describe('useMergeSparkHistory', () => {
  beforeEach(() => {
    getAllActivities.mockReset();
  });

  const setup = () => {
    const version = ref(0);
    const replaceActivity = vi.fn();
    useMergeSparkHistory({
      networkName: () => NetworkNames.Firo,
      hasSelectedAccount: () => true,
      sparkHistoryVersion: () => version.value,
      getShownActivities: () => [shownRow],
      replaceActivity,
      addActivities: vi.fn(),
      activitySources: new Map([
        ['tx', getSparkHistoryOptions(NetworkNames.Firo)],
      ]),
      checkActivity: vi.fn(),
    });
    return { version, replaceActivity };
  };

  it('updates a shown row whose amount was fixed', async () => {
    const { version, replaceActivity } = setup();
    getAllActivities.mockResolvedValue([
      { ...shownRow, type: 'transaction', value: '2' },
    ]);

    version.value++;
    await settle();

    expect(replaceActivity).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ type: 'transaction', value: '2' }),
    );
  });

  it('leaves a shown row alone when nothing changed', async () => {
    const { version, replaceActivity } = setup();
    getAllActivities.mockResolvedValue([{ ...shownRow }]);

    version.value++;
    await settle();

    expect(replaceActivity).not.toHaveBeenCalled();
  });
});
