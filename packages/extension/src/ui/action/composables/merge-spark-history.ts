import { watch } from 'vue';
import { NetworkNames } from '@enkryptcom/types';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import { ActivityOptions } from '@/libs/activity-state/types';
import {
  getSparkHistoryOptions,
  isSparkHistoryOptions,
} from '@/libs/utils/spark-history';
import SparkHistoryState from '@/libs/utils/spark-history-state';

// Pending Spark entries older than this are no longer polled every few
// seconds; they stay as they are until a sync reports their status.
const MAX_SPARK_STATUS_CHECK_AGE = 24 * 60 * 60 * 1000;

type MergeSparkHistoryOptions = {
  networkName: () => string;
  hasSelectedAccount: () => boolean;
  sparkHistoryVersion: () => number;
  getShownActivities: () => Pick<Activity, 'transactionHash' | 'status'>[];
  replaceActivity: (index: number, activity: Activity) => void;
  addActivities: (activities: Activity[]) => void;
  activitySources: Map<string, ActivityOptions>;
  checkActivity: (activity: Activity) => void;
};

/**
 * Adds private (Spark) rows saved by a sync to the activity list already on
 * screen, and refreshes the status of the ones shown, without reloading the
 * whole list (see sparkHistoryVersion in useUpdateActivityState).
 */
export const useMergeSparkHistory = ({
  networkName,
  hasSelectedAccount,
  sparkHistoryVersion,
  getShownActivities,
  replaceActivity,
  addActivities,
  activitySources,
  checkActivity,
}: MergeSparkHistoryOptions) => {
  const sparkHistoryState = new SparkHistoryState();
  let pendingActivityLoads = 0;
  let isSparkMergeSkipped = false;

  const isTooOldForSparkStatusCheck = (act: Activity): boolean => {
    const source = activitySources.get(act.transactionHash);
    return (
      !!source &&
      isSparkHistoryOptions(source) &&
      Date.now() - act.timestamp > MAX_SPARK_STATUS_CHECK_AGE
    );
  };

  const mergeSparkHistory = async () => {
    if (networkName() !== NetworkNames.Firo || !hasSelectedAccount()) {
      return;
    }
    // A full load is in flight and would overwrite this merge; run it once
    // the load is done (see finishActivityLoad).
    if (pendingActivityLoads > 0) {
      isSparkMergeSkipped = true;
      return;
    }
    const sparkOptions = getSparkHistoryOptions(networkName());
    const sparkActivities =
      await sparkHistoryState.getAllActivities(sparkOptions);
    if (pendingActivityLoads > 0) {
      isSparkMergeSkipped = true;
      return;
    }

    const shownActivities = getShownActivities();
    const shownIndexes = new Map(
      shownActivities.map((act, idx) => [act.transactionHash, idx]),
    );
    const added: Activity[] = [];
    for (const act of sparkActivities) {
      if (!act.transactionHash) continue;
      const shownIndex = shownIndexes.get(act.transactionHash);
      if (shownIndex === undefined) {
        activitySources.set(act.transactionHash, sparkOptions);
        added.push(act);
        continue;
      }
      // Only rows that came from the private list; an account's own entry
      // for the same hash keeps its own status.
      const source = activitySources.get(act.transactionHash);
      const shown = shownActivities[shownIndex];
      if (
        source &&
        isSparkHistoryOptions(source) &&
        shown &&
        shown.status !== act.status
      ) {
        replaceActivity(shownIndex, act);
      }
    }
    if (!added.length) return;

    addActivities(added);
    added.forEach(act => {
      if (
        act.status === ActivityStatus.pending &&
        act.type === ActivityType.transaction &&
        !isTooOldForSparkStatusCheck(act)
      ) {
        checkActivity(act);
      }
    });
  };

  const startActivityLoad = () => {
    pendingActivityLoads++;
  };

  const finishActivityLoad = () => {
    pendingActivityLoads--;
    if (pendingActivityLoads === 0 && isSparkMergeSkipped) {
      isSparkMergeSkipped = false;
      mergeSparkHistory();
    }
  };

  watch(sparkHistoryVersion, mergeSparkHistory);

  return {
    isTooOldForSparkStatusCheck,
    startActivityLoad,
    finishActivityLoad,
  };
};
