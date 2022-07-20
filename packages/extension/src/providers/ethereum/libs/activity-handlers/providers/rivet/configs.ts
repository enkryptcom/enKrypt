import { NetworkNames } from "@enkryptcom/types";

const NetworkEndpoints = {
  [NetworkNames.Ethereum]: "https://nodes.mewapi.io/rpc/eth",
  [NetworkNames.Ropsten]: "https://nodes.mewapi.io/rpc/rop",
  [NetworkNames.Rinkeby]: "https://nodes.mewapi.io/rpc/rinkeby",
  [NetworkNames.Goerli]: "https://nodes.mewapi.io/rpc/goerli",
  [NetworkNames.EthereumClassic]: "https://nodes.mewapi.io/rpc/etc",
};

export { NetworkEndpoints };
