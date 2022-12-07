export enum StorageKeys {
  rateInfo = "rate-info",
}

export interface Rate {
  alreadyRated: boolean;
  popupTime: number;
}

export type IState = Rate;
