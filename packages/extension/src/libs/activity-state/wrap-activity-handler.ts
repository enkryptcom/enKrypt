import { ActivityStatus } from "@/types/activity";
import ActivityState from ".";
import { ActivityHandlerType } from "./types";
const CACHE_TTL = 1000 * 60 * 5; // 5 mins
export default (activityHandler: ActivityHandlerType): ActivityHandlerType => {
  const returnFunction: ActivityHandlerType = async (network, address) => {
    const activityState = new ActivityState();
    const options = {
      address: address,
      network: network.name,
    };
    const [activities, cacheTime] = await Promise.all([
      activityState.getAllActivities(options),
      activityState.getCacheTime(options),
    ]);
    if (cacheTime + CACHE_TTL < new Date().getTime()) {
      const liveActivities = await activityHandler(network, address);
      if (!activities.length) {
        await activityState.addActivities(liveActivities, options);
        await activityState.setCacheTime(options);
        return liveActivities;
      } else {
        const pendingActivities = activities.filter(
          (act) => act.status === ActivityStatus.pending
        );
        const liveActivityHashes = liveActivities.map(
          (act) => act.transactionHash
        );
        const stillPendingActivities = pendingActivities.filter(
          (act) => !liveActivityHashes.includes(act.transactionHash)
        );
        const newSet = stillPendingActivities.concat(liveActivities);
        await activityState.addActivities(newSet, options);
        await activityState.setCacheTime(options);
        return newSet;
      }
    } else {
      return activities;
    }
  };
  return returnFunction;
};
