export enum StorageKeys {
  networkInfo = "network-info",
}

export interface NetworkStorageElement {
  name: string;
}

export interface IState {
  networks: NetworkStorageElement[];
}
