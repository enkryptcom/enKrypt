export enum NFTType {
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
  Ordinals = "ORDINALS",
  SolanaBGUM = "SOLANABGUM",
  SolanaToken = "SOLANATOKEN",
}

export interface NFTItem {
  name: string;
  id: string;
  contract: string;
  image: string;
  url: string;
  type: NFTType;
}
export interface NFTCollection {
  name: string;
  image: string;
  description: string;
  items: NFTItem[];
  contract: string;
}
export interface NFTItemWithCollectionName extends NFTItem {
  collectionName: string;
}
