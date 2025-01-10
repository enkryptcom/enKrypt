import { NetworkNames } from "@enkryptcom/types";

export interface Version {
  version: string;
  description?: string;
  chains_added?: NetworkNames[];
  swap_added?: NetworkNames[];
  release_date: string;
  release_link: string;
}
export interface Updates {
  versions: Version[];
}
