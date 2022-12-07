import { NetworkNames } from "@enkryptcom/types";
import type { Provider as InjectedProvider } from "../inject";

export const BitcoinNetworks = {
  BTC: NetworkNames.Bitcoin,
  BTCTest: NetworkNames.BitcoinTest,
};

export interface BitcoinNetworkInfo {
  messagePrefix: string;
  bech32: string;
  bip32: {
    public: number;
    private: number;
  };
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
  dustThreshold: null;
}

export interface HaskoinBalanceType {
  address: string;
  confirmed: number;
  unconfirmed: number;
  utxo: number;
  txs: number;
  received: number;
}
export interface HaskoinUnspentType {
  address: string;
  block: {
    height: number;
    position: number;
  };
  txid: string;
  index: number;
  pkscript: string;
  value: number;
}
export interface HaskoinTxType {
  txid: string;
  size: number;
  version: number;
  locktime: number;
  fee: number;
  inputs: {
    txid: string;
    pkscript: string;
    value: number;
    address: string;
  }[];
  outputs: {
    address: string;
    pkscript: string;
    value: number;
  }[];
  block: {
    height?: number;
    position?: number;
    mempool?: number;
  };
  time: number;
}

export interface RPCTxType {
  to: string;
  value: number;
}

export { InjectedProvider };
