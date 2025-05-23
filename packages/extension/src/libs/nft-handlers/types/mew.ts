import { NFTType } from '@/types/nft';

export enum ContentRepresentation {
  IMAGE = 'IMAGE',
  MEDIA = 'MEDIA',
}
export interface Trait {
  trait: string;
  count: number;
  value: string;
  percentage: string;
}
export interface ContentURL {
  type: ContentRepresentation;
  url: string;
}
export interface NFTAsset {
  token_id: string;
  name: string;
  description: string;
  traits: Trait[];
  urls: ContentURL[];
  opensea_url: string;
}
export interface SocialLinks {
  website?: string;
  discord?: string;
}
export interface CollectionStats {
  count: string;
  owners: string;
}
export interface NFTCollection {
  name: string;
  description: string;
  image: string;
  schema_type: NFTType;
  contract_address: string;
  contract_name: string;
  contract_symbol: string;
  social: SocialLinks;
  stats: CollectionStats;
  assets: NFTAsset[];
}
