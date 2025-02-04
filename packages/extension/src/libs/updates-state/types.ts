export enum StorageKeys {
  updatesInfo = 'updates-info',
}

export interface IState {
  lastVersionViewed: string;
  currentRelease: string;
  currentReleaseTimestamp: number;
}
