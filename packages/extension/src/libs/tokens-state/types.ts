import { NetworkNames } from "@enkryptcom/types";

export enum StorageKeys {
  customTokens = "custom-tokens",
}

export enum TokenType {
  ERC20 = "ERC20",
}

export interface CustomToken {
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  type: TokenType;
  coingeckoID?: string;
}

export interface CustomErc20Token extends CustomToken {
  address: `0x${string}`;
}

export type IState = Partial<Record<NetworkNames, CustomToken[]>>;
