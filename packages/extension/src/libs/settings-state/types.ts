export enum StorageKeys {
  evmState = 'evm-settings-state',
  substrateState = 'substrate-settings-state',
  btcState = 'btc-settings-state',
  enkryptState = 'enkrypt-settings-state',
  currencyState = 'currency-settings-state',
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
export interface EnkryptSettingsType {
  installedTimestamp: number;
  randomUserID: string;
  isMetricsEnabled: boolean;
}

export interface CurrencySettingsType {
  value: string;
}
export interface SettingsType {
  evm: EVMSettingsType;
  substrate: SubstrateSettingsType;
  btc: BtcSettingsType;
  enkrypt: EnkryptSettingsType;
  currencySettingsState: CurrencySettingsType;
  manifestVersion: number;
}
