import { NFTType } from '@/types/nft';

export interface GRNFTType {
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  supports_erc: string[];
  nft_data: {
    token_id: string;
    token_balance: string;
    token_url: string;
    original_owner: string;
    current_owner: string;
    image_cached: boolean;
    external_data: {
      name: string;
      description: string;
      asset_url: string;
      image: string;
      image_256: string;
      image_512: string;
      image_1024: string;
    };
  }[];
}

export interface SHNFTType {
  nft_id: string;
  chain: string;
  token_id: string;
  contract_address: string;
  name: string;
  description: string;
  image_url: string;
  video_url: string | null;
  audio_url: string | null;
  previews: {
    image_small_url: string;
    image_medium_url: string;
    image_large_url: string;
  };
  external_url: string;
  collection: {
    name: null | string;
    description: null | string;
    image_url: string;
    external_url: string;
    collection_id: string;
    spam_score: number;
    marketplace_pages: {
      marketplace_id: string;
      marketplace_name: string;
      collection_url: string;
      nft_url: string;
    }[];
  };
  contract: {
    name: string;
    type: NFTType;
  };
}
export interface SHOrdinalsNFTType extends SHNFTType {
  extra_metadata: {
    ordinal_details: {
      location: string;
      protocol_name: string;
    };
  };
}

export interface SHSolanaNFTType extends SHNFTType {
  extra_metadata: {
    token_program: string;
  };
}

export interface GRResponse {
  data: {
    items: GRNFTType[];
  };
}

export interface SHResponse {
  next: string;
  previous: string;
  nfts: SHNFTType[];
}

export interface SHOrdinalsResponse {
  next: string;
  previous: string;
  nfts: SHOrdinalsNFTType[];
}
