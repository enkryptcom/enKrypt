import {
  BN,
  EVMTransaction,
  NetworkType,
  SolanaTransaction,
} from "../../types";

export type RangoEVMTransactions = {
  type: NetworkType.EVM;
  transactions: EVMTransaction[];
};

export type RangoSolanaTransactions = {
  type: NetworkType.Solana;
  transactions: SolanaTransaction[];
};

export type RangoNetworkedTransactions =
  | RangoEVMTransactions
  | RangoSolanaTransactions;

export interface RangoSwapResponse {
  networkTransactions: RangoNetworkedTransactions;
  additionalNativeFees: BN;
  toTokenAmount: BN;
  fromTokenAmount: BN;
  requestId: string;
}
