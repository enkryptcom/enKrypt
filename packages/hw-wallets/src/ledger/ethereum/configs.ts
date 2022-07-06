import { NetworkNames } from "@enkryptcom/types";

const supportedPaths = {
  [NetworkNames.Ethereum]: ["m/44'/60'/0'/{index}", "m/44'/60'/{index}'/0/0"],
  [NetworkNames.EthereumClassic]: [
    "m/44'/60'/160720'/0'/{index}",
    "m/44'/61'/{index}'/0/0",
  ],
  [NetworkNames.Ropsten]: ["m/44'/1'/0'/0/{index}"],
  [NetworkNames.Goerli]: ["m/44'/1'/0'/0/{index}"],
};
export { supportedPaths };
