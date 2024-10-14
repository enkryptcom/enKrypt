export interface TomoscanTxType {
  blockNumber: number;
  timestamp: number;
  hash: string;
  nonce: number;
  blockHash: string;
  from: string;
  to: string;
  contractAddress: string | null;
  value: string;
  gas: number;
  gasPrice: number;
  status: string;
  input: string;
  gasUsed: number;
}
