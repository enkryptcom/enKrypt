export interface NFTItem {
  name: string;
  id: string;
  contract: string;
  valueUSD: string;
  image: string;
  collection: string;
}
export interface NFTCollection {
  name: string;
  image: string;
  description: string;
  items: NFTItem[];
}
