export enum StorageKeys {
  networkInfo = "network-info",
}

export interface IState {
  networks?: Array<[string, boolean]>;
}
