import { AssetsType } from '@/types/provider';

export enum StorageKeys {
  accountCache = 'account-cache',
}

/** An asset as it is stored. baseToken is a class instance, so it is left out. */
export type CachedAsset = Omit<AssetsType, 'baseToken'>;

/** What the popup last showed for one account on one network. */
export interface CachedAccountInfo {
  /** Native balance, as the accounts store holds it */
  balance?: string;
  fiatAmount?: string;
  tokenPrice?: string;
  priceChangePercentage?: number;
  sparkline?: string;
  assets?: CachedAsset[];
  /** When the entry was last saved, in milliseconds since the epoch */
  updatedAt: number;
}

export interface IState {
  /** Version of the extension that saved the entries */
  version: string;
  entries: Record<string, CachedAccountInfo>;
}
