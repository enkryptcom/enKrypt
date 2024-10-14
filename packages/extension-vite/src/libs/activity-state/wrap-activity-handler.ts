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
        await activityState.addActivities(liveActivities, options);
        await activityState.setCacheTime(options);
        return activityState.getAllActivities(options);
      }
    } else {
      return activities;
    }
  };
  return returnFunction;
};
