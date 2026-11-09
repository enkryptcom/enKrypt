import BrowserStorage from '@/libs/common/browser-storage';
import { ActivityOptions } from '@/libs/activity-state/types';
import { createAsyncLock } from '@/libs/utils/async-mutex';
import { Activity } from '@/types/activity';
import { InternalStorageNamespace } from '@/types/provider';

const STORAGE_KEY = 'activity';
const MAX_SPARK_ACTIVITIES = 500;
// Every write reads the whole list and saves it back; run them one at a time
// so a sync saving its rows cannot drop a send saved a moment earlier.
const sparkHistoryWriteLock = createAsyncLock();

/**
 * Private (Spark) history, kept in its own storage instead of the shared
 * ActivityState one. The explorer cannot see Spark sends, so this list is
 * their only record: writes to other accounts' history must never touch it,
 * and pending entries are not dropped after a while like account ones are.
 */
class SparkHistoryState {
  #storage: BrowserStorage;
  #legacyStorage: BrowserStorage;

  constructor() {
    this.#storage = new BrowserStorage(
      InternalStorageNamespace.sparkActivityState,
    );
    this.#legacyStorage = new BrowserStorage(
      InternalStorageNamespace.activityState,
    );
  }

  getActivityId(options: ActivityOptions) {
    return `${options.address.toLowerCase()}-${options.network}`;
  }

  async addActivities(
    activity: Activity[],
    options: ActivityOptions,
  ): Promise<void> {
    return sparkHistoryWriteLock.run(async () => {
      const activities = await this.getAllActivities(options);
      // A sync later reports the same tx with less detail ("Hidden" address,
      // coin value); keep what the send page saved and take only the status.
      const newActivities = activity.filter(newAct => {
        const existing = activities.find(
          act => act.transactionHash === newAct.transactionHash,
        );
        if (!existing) return true;
        existing.status = newAct.status;
        return false;
      });
      const combined = activities
        .concat(newActivities)
        .sort((a, b) => b.timestamp - a.timestamp);
      await this.#setActivities(
        combined.slice(0, MAX_SPARK_ACTIVITIES),
        options,
      );
    });
  }

  async updateActivity(
    activity: Activity,
    options: ActivityOptions,
  ): Promise<void> {
    return sparkHistoryWriteLock.run(async () => {
      const activities = await this.getAllActivities(options);
      const updated = activities.map(act =>
        act.transactionHash === activity.transactionHash ? activity : act,
      );
      await this.#setActivities(updated, options);
    });
  }

  /** Falls back to the shared ActivityState storage, where older versions
   * kept this list, until the first write here copies it over. */
  async getAllActivities(options: ActivityOptions): Promise<Activity[]> {
    const id = this.getActivityId(options);
    const saved: Record<string, Activity[]> | null =
      (await this.#storage.get(id)) ?? (await this.#legacyStorage.get(id));
    return saved?.[STORAGE_KEY] ?? [];
  }

  async #setActivities(
    activities: Activity[],
    options: ActivityOptions,
  ): Promise<void> {
    await this.#storage.set(this.getActivityId(options), {
      [STORAGE_KEY]: activities,
    });
  }
}

export default SparkHistoryState;
