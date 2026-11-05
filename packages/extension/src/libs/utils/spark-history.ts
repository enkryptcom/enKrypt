import { ActivityOptions } from '@/libs/activity-state/types';

export const SPARK_HISTORY_ADDRESS = 'spark-history';

export const isSparkHistoryOptions = (options: ActivityOptions): boolean =>
  options.address === SPARK_HISTORY_ADDRESS;

/**
 * Firo's private (Spark) wallet comes from the seed phrase and is shared by
 * every Firo account, so its history is kept in one list of its own instead
 * of under an account. Every Firo account shows it. Keeping it apart also
 * stops explorer history from pushing it out of the stored account list.
 */
export const getSparkHistoryOptions = (network: string): ActivityOptions => ({
  address: SPARK_HISTORY_ADDRESS,
  network,
});
