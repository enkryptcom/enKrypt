import { InternalStorageNamespace } from '@/types/provider';
import BrowserStorage from '@/libs/common/browser-storage';
import { ActivityOptions } from './types';
import { Activity, ActivityStatus } from '@/types/activity';
const STORAGE_KEY = 'activity';
const MAX_PENDING_TIME = 12 * 60 * 60 * 1000; // 12 hours

class ActivityState {
  #storage: BrowserStorage;
  constructor() {
    this.#storage = new BrowserStorage(InternalStorageNamespace.activityState);
  }
  getActivityId(options: ActivityOptions) {
    return `${options.address.toLowerCase()}-${options.network}`;
  }
  getActivityCacheId(options: ActivityOptions) {
    return `${options.address.toLowerCase()}-${options.network}-cachetime`;
  }
  async addActivities(
    activity: Activity[],
    options: ActivityOptions,
  ): Promise<void> {
    let activities = await this.getActivitiesById(this.getActivityId(options));
    const liveHashesToRemove: string[] = [];
    const oldHashesToRemove: string[] = [];
    activities.forEach(act => {
      activity.forEach(lact => {
        if (act.transactionHash === lact.transactionHash) {
          act.status = lact.status;
          liveHashesToRemove.push(lact.transactionHash);
        }
        if (
          act.nonce &&
          act.nonce === lact.nonce &&
          act.transactionHash !== lact.transactionHash &&
          (lact.status === ActivityStatus.success ||
            lact.status === ActivityStatus.failed)
        ) {
          oldHashesToRemove.push(act.transactionHash);
        }
      });
    });
    activity = activity.filter(
      a => !liveHashesToRemove.includes(a.transactionHash),
    );
    activities = activities.filter(
      a => !oldHashesToRemove.includes(a.transactionHash),
    );
    let combined = activities.concat(activity);
    combined.sort((a, b) => {
      return b.timestamp - a.timestamp;
    });
    const currentTime = new Date().getTime();
    combined = combined.filter(
      a =>
        a.status !== ActivityStatus.pending ||
        a.timestamp > currentTime - MAX_PENDING_TIME,
    );
    await this.setActivitiesById(
      combined.slice(0, 50),
      this.getActivityId(options),
    );
  }

  async updateActivity(
    activity: Activity,
    options: ActivityOptions,
  ): Promise<void> {
    const activities = await this.getActivitiesById(
      this.getActivityId(options),
    );
    const clone = [...activities];
    activities.forEach((act, idx) => {
      if (act.transactionHash === activity.transactionHash)
        clone[idx] = activity;
    });
    await this.setActivitiesById(clone, this.getActivityId(options));
  }

  async setCacheTime(options: ActivityOptions): Promise<void> {
    await this.#storage.set(this.getActivityCacheId(options), {
      [STORAGE_KEY]: new Date().getTime(),
    });
  }

  async getCacheTime(options: ActivityOptions): Promise<number> {
    const cacheTime: Record<string, number> = await this.#storage.get(
      this.getActivityCacheId(options),
    );
    if (!cacheTime || !cacheTime[STORAGE_KEY]) return 0;
    return cacheTime[STORAGE_KEY];
  }

  async getAllActivities(options: ActivityOptions): Promise<Activity[]> {
    return this.getActivitiesById(this.getActivityId(options));
  }

  async deleteAllActivities(options: ActivityOptions): Promise<void> {
    this.setActivitiesById([], this.getActivityId(options));
  }

  private async setActivitiesById(
    activities: Activity[],
    id: string,
  ): Promise<void> {
    await this.#storage.set(id, {
      [STORAGE_KEY]: activities,
    });
  }

  private async getActivitiesById(id: string): Promise<Activity[]> {
    const allStates: Record<string, Activity[]> = await this.#storage.get(id);
    if (!allStates || !allStates[STORAGE_KEY]) return [];
    return allStates[STORAGE_KEY];
  }
}
export default ActivityState;
