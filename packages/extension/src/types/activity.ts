import { getNetworkByName } from "@/libs/utils/networks";
import { NetworkNames } from "@enkryptcom/types";
import { BaseNetwork } from "./base-network";
import { BaseTokenOptions } from "./base-token";

interface EthereumRawInfo {
  blockHash: string;
  blockNumber: string;
  contractAddress: string | null;
  effectiveGasPrice: string;
  from: string;
  to: string | null;
  gasUsed: string;
  status: string;
  transactionHash: string;
  type: string;
  input: string;
  nonce: string;
  value: string;
}

interface SubstrateRawInfo {
  from: string;
  to: string;
  extrinsic_index: string;
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

enum ActivityStatus {
  pending = "pending",
  success = "success",
  failed = "failed",
}
interface Activity {
  network: NetworkNames;
  from: string;
  to: string;
  timestamp: number;
  isIncoming: boolean;
  token: BaseTokenOptions;
  status: ActivityStatus;
  rawInfo: EthereumRawInfo | SubstrateRawInfo;
}

export abstract class ActivityHandler {
  public address: string;
  public network: BaseNetwork;
  constructor(networkName: NetworkNames, address: string) {
    this.address = address;
    this.network = getNetworkByName(networkName)!;
  }
  abstract getAllActivity(): Promise<Activity[]>;
}

export { EthereumRawInfo, SubstrateRawInfo, Activity, ActivityStatus };
