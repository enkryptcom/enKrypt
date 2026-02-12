export interface ECashNetworkInfo {
  messagePrefix: string;
  bech32: string;
  bip32: {
    public: number;
    private: number;
  };
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
  cashAddrPrefix: string;
}

export interface ChronikTx {
  txid: string;
  version: number;
  inputs: Array<{
    prevOut: {
      txid: string;
      outIdx: number;
    };
    inputScript: string;
    outputScript: string;
    value: string;
    sequenceNo: number;
    token?: any;
  }>;
  outputs: Array<{
    value: string;
    outputScript: string;
    token?: any;
    spentBy?: {
      txid: string;
      outIdx: number;
    };
  }>;
  lockTime: number;
  timeFirstSeen: string;
  size: number;
  isCoinbase: boolean;
  block?: {
    height: number;
    hash: string;
    timestamp: string;
  };
}
