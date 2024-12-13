export interface TelosTXType {
  gasused: string;
  contractAddress: string;
  index: number;
  nonce: number;
  input: string;
  gasLimit: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  hash: string;
  timestamp: number;
  gasPrice: string;
  status: '0x1' | '0x0';
}
