export enum StorageKeys {
  networkInfo = "network-info",
}

export interface IState {
  networks?: Array<{ name: string; isActive: boolean }>;
}
