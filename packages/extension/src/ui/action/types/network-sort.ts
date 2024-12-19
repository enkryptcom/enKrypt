export enum NetworkSortOption {
  Name = 'name',
  Tvl = 'tvl',
};
export enum NetworkSortDirection {
  Asc = 'asc',
  Desc = 'desc',
};

export interface NetworkSort {
  name: NetworkSortOption;
  direction: NetworkSortDirection;
}
