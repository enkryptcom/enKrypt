import { NetworkNames } from "@enkryptcom/types";
import type { Provider as InjectedProvider } from "../inject";
import { PaymentType } from "./bitcoin-network";

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
  paymentType: PaymentType;
  maxFeeRate: number;
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
  raw?: string;
}
export interface SSUnspentType {
  txid: string;
  vout: number;
  value: string;
  height: number;
  confirmations: number;
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

export interface SSTxType {
  txid: string;
  blockHash: string;
  blockHeight: number;
  timestamp: number;
  confirmations: number;
  fee: string;
  hex: string;
  vin: {
    txid: string;
    addresses?: string[];
    value: string;
  }[];
  vout: {
    addresses?: string[];
    value: string;
    scriptPubKey: {
      hex: string;
    };
  }[];
}

export interface RPCTxType {
  to: string;
  value: number;
}

export { InjectedProvider };
