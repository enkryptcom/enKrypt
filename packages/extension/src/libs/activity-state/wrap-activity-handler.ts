import { getAddressWithoutPrefix } from '@/providers/ecash/libs/utils';
import ActivityState from '.';
import { ActivityHandlerType } from './types';

const CACHE_TTL = 1000 * 60 * 5;
const ECASH_CACHE_TTL = 1000 * 3;

export default (activityHandler: ActivityHandlerType): ActivityHandlerType => {
  const returnFunction: ActivityHandlerType = async (network, address) => {
    const activityState = new ActivityState();

    const cacheAddress =
      typeof address === 'string' ? getAddressWithoutPrefix(address) : address;

    const options = {
      address: cacheAddress,
      network: network.name,
    };

    // Use shorter cache TTL for eCash due to faster finality
    const cacheTTL = network.name === 'XEC' ? ECASH_CACHE_TTL : CACHE_TTL;

    const [activities, cacheTime] = await Promise.all([
      activityState.getAllActivities(options),
      activityState.getCacheTime(options),
    ]);

    if (cacheTime + cacheTTL < new Date().getTime()) {
      const liveActivities = await activityHandler(network, cacheAddress);
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
