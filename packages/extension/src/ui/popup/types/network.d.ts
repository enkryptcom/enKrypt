export interface NetworkItem {
  id: number;
  title: string;
  image: string;
}

export interface NetworkState {
  selected?: NetworkItem;
}
