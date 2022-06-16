import { BaseToken } from "@/types/base-token";
import { SubstrateNetwork } from "../../types/substrate-network";

export interface TransferProps {
  to: string;
  token: BaseToken;
  amount: string;
}

export type MethodMap = Record<
  string,
  [any, (network: SubstrateNetwork, args: any) => any]
>;
