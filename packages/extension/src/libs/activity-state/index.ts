import { InternalStorageNamespace } from "@/types/provider";
import BrowserStorage from "@/libs/common/browser-storage";
import { ActivityOptions } from "./types";
import { Activity } from "@/types/activity";
const STORAGE_KEY = "activity";
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
    options: ActivityOptions
  ): Promise<void> {
    const activities = await this.getActivitiesById(
      this.getActivityId(options)
    );
    await this.setActivitiesById(
      activity.concat(activities),
      this.getActivityId(options)
    );
  }
  async updateActivity(
    activity: Activity,
    options: ActivityOptions
  ): Promise<void> {
    const activities = await this.getActivitiesById(
      this.getActivityId(options)
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
      this.getActivityCacheId(options)
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
    id: string
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
