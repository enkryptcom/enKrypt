interface NFTMeta {
  name: string;
  description: string;
  content: NFTContent[];
}
interface bestBidOrder {
  takePriceUsd: string;
}
export enum ContentRepresentation {
  ORIGINAL = "ORIGINAL",
  BIG = "BIG",
  PREVIEW = "PREVIEW",
  IMAGE = "IMAGE",
}
export interface NFTContent {
  "@type": "IMAGE";
  url: string;
  representation: ContentRepresentation;
  mimeType: "image/jpeg";
  size: number;
  width: number;
  height: number;
}
export interface RaribleItem {
  id: string;
  blockchain: string;
  collection: string;
  contract: string;
  tokenId: string;
  meta: NFTMeta;
  bestBidOrder: bestBidOrder;
}
export interface RaribleCollectionItem {
  name: string;
  meta: NFTMeta;
}
