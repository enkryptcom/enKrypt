import { NFTItem } from '@/types/nft';

export interface ConfluxNFTItem {
  owner: string;
  contract: string;
  tokenId: string;
  amount: string;
  type: string;
  name: string;
  image: string;
  description: string;
  rawData: object;
}

export interface NFTBalanceItem {
  owner: string;
  contract: string;
  balance: string;
  name: string;
  symbol: string;
  type: string;
  website: string | null;
  iconUrl: string | null;
}

export interface ListResponse {
  total: number;
  list: object[];
}

export interface ConfluxResponse {
  status: string;
  message: string;
  result: ListResponse;
}

export interface NFTItemWithDesc extends NFTItem {
  description: string;
}
