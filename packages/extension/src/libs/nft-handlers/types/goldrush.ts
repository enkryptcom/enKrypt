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

export interface GRResponse {
  data: {
    items: GRNFTType[];
  };
}
