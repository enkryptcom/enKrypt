import { HWwalletNames } from "@enkryptcom/types";

export interface HWWalletAccountType {
  address: string;
  balance: string;
  selected: boolean;
  path: string;
  walletType: HWwalletNames;
  index: number;
  name: string;
}

export interface PathType {
  path: string;
  basePath: string;
  label: string;
}
