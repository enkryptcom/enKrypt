import { ActivityOptions } from '@/libs/activity-state/types';

/**
 * Firo's private (Spark) wallet comes from the seed phrase and is shared by
 * every Firo account, so its history is kept in one list of its own instead
 * of under an account. Every Firo account shows it. Keeping it apart also
 * stops explorer history from pushing it out of the stored account list.
 */
export const getSparkHistoryOptions = (network: string): ActivityOptions => ({
  address: 'spark-history',
  network,
});
