export interface NFTItem {
  name: string;
  id: string;
  contract: string;
  image: string;
  url: string;
}
export interface NFTCollection {
  name: string;
  image: string;
  description: string;
  items: NFTItem[];
  contract: string;
}
