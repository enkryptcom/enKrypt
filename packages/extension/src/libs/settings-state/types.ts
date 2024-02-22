export enum StorageKeys {
  evmState = "evm-settings-state",
  substrateState = "substrate-settings-state",
  btcState = "btc-settings-state",
}
export interface EVMInjectSettings {
  disabled: boolean;
  timestamp: number;
}
export interface EVMSettingsType {
  inject: EVMInjectSettings;
}
export interface SubstrateSettingsType {
  injectPolkadotjs: boolean;
}
export interface BtcSettingsType {
  injectUnisat: boolean;
}
export interface SettingsType {
  evm: EVMSettingsType;
  substrate: SubstrateSettingsType;
  btc: BtcSettingsType;
  manifestVersion: number;
}
