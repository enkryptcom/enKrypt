import { HWwalletType } from "@enkryptcom/types";

export interface PathType {
  path: string;
  basePath: string;
  label?: string;
}

export interface HWWalletAccountType {
  address: string;
  publicKey: string;
  balance: string;
  selected: boolean;
  path: string;
  pathType: PathType;
  walletType: HWwalletType;
  index: number;
  name: string;
}
