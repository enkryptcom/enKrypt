export interface HeliusNFTType {
  interface: string;
  id: string;
  content: {
    files: {
      uri: string;
      cdn_uri: string;
      mime: string;
    }[];
    metadata: {
      description: string;
      name: string;
      symbol: string;
    };
  };
  compression: {
    compressed: boolean;
  };
}

export interface HeliusResponse {
  error?: string;
  result: {
    items: HeliusNFTType[];
  };
}
