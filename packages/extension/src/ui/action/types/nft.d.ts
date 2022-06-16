export interface NFTAuthor {
  id: number;
  name: string;
  image: string;
  items: NFTItem[];
}

export interface NFTItem {
  id: number;
  name: string;
  image: string;
  price: number;
  author: string;
}
