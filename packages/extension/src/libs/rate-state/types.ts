export enum StorageKeys {
  rateInfo = 'rate-info',
}

export interface Rate {
  alreadyRated: boolean;
  popupTime: number;
  askedAfterActivity: boolean;
}

export type IState = Rate;
