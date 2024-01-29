import { NetworkNames } from "@enkryptcom/types";
import { BaseTokenOptions } from "./base-token";
import {
  TokenType,
  TokenTypeTo,
  StatusOptionsResponse,
} from "@enkryptcom/swap";
import { ICommandResult } from "@kadena/client";

interface BTCInOuts {
  address: string;
  value: number;
}

interface BTCRawInfo {
  blockNumber: number;
  transactionHash: string;
  timestamp: number | undefined;
  inputs: BTCInOuts[];
  outputs: BTCInOuts[];
  fee: number;
}

interface EthereumRawInfo {
  blockHash: string;
  blockNumber: string;
  contractAddress: string | null;
  effectiveGasPrice: string;
  from: string;
  to: string | null;
  gas: string;
  gasUsed: string;
  status: boolean;
  transactionHash: string;
  data: string;
  nonce: string;
  value: string;
  timestamp: number | undefined;
}

interface SubscanExtrinsicInfo {
  success: boolean;
  finalized: boolean;
  pending: boolean;
  extrinsic_hash: string;
  call_module: string;
  block_timestamp: number;
  block_num: number;
}

interface SubstrateRawInfo {
  from: string;
  to: string;
  success: boolean;
  hash: string;
  block_num: number;
  block_timestamp: number;
  module: string;
  amount: string;
  fee: string;
  nonce: number;
  asset_symbol: string;
  asset_type: string;
}

type KadenaRawInfo = ICommandResult;

enum ActivityStatus {
  pending = "pending",
  success = "success",
  failed = "failed",
}

enum ActivityType {
  transaction = "transaction",
  swap = "swap",
}
interface SwapRawInfo {
  fromToken: TokenType;
  toToken: TokenTypeTo;
  status: StatusOptionsResponse;
}
interface Activity {
  network: NetworkNames;
  from: string;
  to: string;
  chainId?: string;
  crossChainId?: number;
  value: string;
  timestamp: number;
  nonce?: string;
  isIncoming: boolean;
  transactionHash: string;
  token: BaseTokenOptions;
  status: ActivityStatus;
  type: ActivityType;
  rawInfo?:
    | EthereumRawInfo
    | SubstrateRawInfo
    | SubscanExtrinsicInfo
    | BTCRawInfo
    | SwapRawInfo
    | KadenaRawInfo;
}

export {
  EthereumRawInfo,
  SubstrateRawInfo,
  Activity,
  ActivityStatus,
  ActivityType,
  SubscanExtrinsicInfo,
  BTCRawInfo,
  SwapRawInfo,
  KadenaRawInfo,
};
