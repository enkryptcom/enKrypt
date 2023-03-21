import { GasPriceTypes } from "@/providers/common/types";
import { BN } from "ethereumjs-util";

export interface AccessList {
  address: `0x${string}`;
  storageKeys: `0x${string}`[];
}

interface FormattedBlockFees {
  number: number | string;
  baseFeePerGas: BN;
  gasUsedRatio: number;
  priorityFeePerGas: BN[];
}

export interface FormattedFeeHistory {
  blocks: FormattedBlockFees[];
  highestBaseFee: BN;
  pendingBlock: FormattedBlockFees;
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
  tokenSymbol: string;
  tokenName: string;
  tokenImage: string;
  tokenTo: string | null;
  dataHex: string;
  decodedHex?: string[];
  decoded: boolean;
}

export interface TransactionOptions {
  gasPriceType: GasPriceTypes;
}
export interface DataDecodeResponse {
  decoded: boolean;
  values: string[];
  function?: string;
  tokenValue?: string;
  tokenTo?: string;
  isToken: boolean;
}

export interface GasCosts {
  [GasPriceTypes.ECONOMY]: string;
  [GasPriceTypes.REGULAR]: string;
  [GasPriceTypes.FAST]: string;
  [GasPriceTypes.FASTEST]: string;
}
