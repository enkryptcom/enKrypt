export enum StorageKeys {
  accountsState = "kadena-accounts-state",
  chainIdState = "kadena-chainId-state",
}
export interface IState {
  isApproved: boolean;
  chainId: string;
}
