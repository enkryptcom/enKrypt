export interface AccessList {
  address: `0x${string}`;
  storageKeys: `0x${string}`[];
}
export interface EthereumTransaction {
  from: `0x${string}`;
  data?: `0x${string}`;
  gasLimit?: `0x${string}`;
  gas?: `0x${string}`;
  maxPriorityFeePerGas?: `0x${string}`;
  maxFeePerGas?: `0x${string}`;
  gasPrice?: `0x${string}`;
  nonce?: `0x${string}`;
  to?: `0x${string}` | undefined;
  value?: `0x${string}`;
  v?: `0x${string}`;
  r?: `0x${string}`;
  s?: `0x${string}`;
  chainId: `0x${string}`;
  accessList?: AccessList[];
  type?: `0x${string}`;
}

export interface FinalizedLegacyEthereumTransaction
  extends EthereumTransaction {
  data: `0x${string}`;
  gasLimit: `0x${string}`;
  gasPrice: `0x${string}`;
  nonce: `0x${string}`;
  to: `0x${string}` | undefined;
  value: `0x${string}`;
}
export interface FinalizedFeeMarketEthereumTransaction
  extends Omit<EthereumTransaction, "gasPrice"> {
  data: `0x${string}`;
  gasLimit: `0x${string}`;
  maxPriorityFeePerGas: `0x${string}`;
  maxFeePerGas: `0x${string}`;
  nonce: `0x${string}`;
  to: `0x${string}` | undefined;
  value: `0x${string}`;
  type: "0x02";
}
export interface DecodedTx {
  toAddress?: string;
  isContractCreation: boolean;
  currentPriceUSD: number;
  tokenValue: string;
  tokenDecimals: number;
  tokenName: string;
  tokenImage: string;
  dataHex: string;
  decodedHex?: string[];
}
export enum GasPriceTypes {
  ECONOMY,
  REGULAR,
  FAST,
}

export interface DataDecodeResponse {
  decoded: boolean;
  values: string[];
  function?: string;
  isToken: boolean;
}
