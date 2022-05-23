export enum StorageKeys {
  networkInfo = "network-info",
}

/** Network State Storage */
export interface IState {
  /** @networks [][network name, active state]  */
  networks?: Array<[string, boolean]>;
}
