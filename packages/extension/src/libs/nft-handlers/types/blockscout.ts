export type BlockscoutNFTItem = {
  amount: string;
  token: Token;
  token_instances: TokenInstance[];
};

export type Token = {
  address_hash: string;
  holders_count: string;
  icon_url: string;
  name: string | null;
  type: string;
};

export type TokenInstance = {
  id: string;
  image_url: string;
  media_url: string;
  metadata: TokenMetadata;
  owner: string;
  token: Token;
  token_type: string;
};

export type TokenMetadata = {
  attributes?: Attribute[];
  background_color?: string;
  description?: string;
  external_url?: string;
  image_data?: string;
  name: string;
  image?: string;
};

export type Attribute = {
  trait_type: string;
  value: string | number;
  display_type?: string;
};