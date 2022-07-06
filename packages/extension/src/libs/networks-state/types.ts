export enum StorageKeys {
  networkInfo = "network-info",
}

export interface NetworkStorageElement {
  name: string;
  isActive: boolean;
  order?: number;
}

export interface IState {
  networks?: Array<{ name: string; isActive: boolean; order?: number }>;
}
