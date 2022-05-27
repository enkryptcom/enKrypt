import { NetworkNames } from "@enkryptcom/types";

const supportedPaths = {
  [NetworkNames.Ethereum]: ["m/44'/60'/0'/{index}"],
  [NetworkNames.EthereumClassic]: ["m/44'/60'/160720'/0'/{index}"],
};
export { supportedPaths };
