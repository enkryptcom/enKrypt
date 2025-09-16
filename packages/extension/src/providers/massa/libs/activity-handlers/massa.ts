import { BaseNetwork } from '@/types/base-network';
import { Activity } from '@/types/activity';
import { ActivityHandlerType } from '@/libs/activity-state/types';
import ActivityState from '@/libs/activity-state';

const MassaActivity: ActivityHandlerType = async (
  network: BaseNetwork,
  address: string,
): Promise<Activity[]> => {
  try {
    // Get activities from local storage
    const activityState = new ActivityState();
    const activities = await activityState.getAllActivities({
      address,
      network: network.name,
    });

    // For now, return local activities
    // In the future, this can be extended to fetch from Massa explorer API
    return activities;
  } catch (error) {
    console.error('Error fetching Massa activities:', error);
    return [];
  }
};

export default MassaActivity;
