export interface EtherscanTxType {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  to: string;
  contractAddress: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  input: string;
  gasUsed: string;
}
