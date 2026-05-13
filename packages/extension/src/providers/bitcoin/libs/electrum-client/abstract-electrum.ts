export class TransactionModel {
  tx_hash: string = '';
  height: number = 0;
  tx_pos: number = 0;
  value: number = 0;
}

export type UnspentTxOutputModel = {
  vout: number;
  raw: string;
  height: number;
  amount: number;
  satoshis: number;
  txid: string;
  confirmations: number;
  address: string;
  scriptPubKey: string;
};

export type VIn = {
  address: string;
  addresses: Array<string>;
  txid: string;
  value: number;
  vout: number;
  nFees: number;
};

export type VOut = {
  addresses: Array<string>;
  value: number;
  scriptPubKey: ScriptPubKey;
};

export type ScriptPubKey = {
  addresses: Array<string>;
  type: string;
};

export class FullTransactionModel {
  address: string = '';
  blockHash: number = 0;
  blockTime: number = 0;
  confirmation: number = 0;
  hash: string = '';
  height: number = 0;
  hex: string = '';
  vin: Array<VIn> = [];
  vout: Array<VOut> = [];
  inputs: Array<VIn> = [];
  outputs: Array<VOut> = [];
  size: number = 0;
  time: number = 0;
  txid: string = '';
  type: number = 0;
  version: number = 0;
  confirmations: number = 0;
}

export type AnonymitySetModel = {
  coins: string[][];
  blockHash: string;
  setHash: string;
};

export type AnonymitySetMetaModel = {
  size: number;
  blockHash: string;
  setHash: string;
};

export type UsedSerialsModel = {
  serials: string[];
};

export type MyCoinModel = {
  setId: number;
  setHash: string;
  coin: string[];
  tag: string;
  value: bigint;
  isUsed: boolean;
  transactionHash?: string;
};
