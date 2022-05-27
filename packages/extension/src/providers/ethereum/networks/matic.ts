import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import tokenbalanceMew from "@/providers/ethereum/libs/assets-handlers/tokenbalance-mew";

const maticOptions: EvmNetworkOptions = {
  name: NetworkNames.Matic,
  name_long: "Polygon (Matic)",
  homePage: "https://polygonscan.com/",
  blockExplorerTX: "https://polygonscan.com/tx/[[txHash]]",
  blockExplorerAddr: "https://polygonscan.com/address/[[address]]",
  chainID: 137,
  isTestNetwork: false,
  currencyName: "MATIC",
  node: "wss://nodes.mewapi.io/ws/matic",
  icon: require("./icons/matic.svg"),
  gradient: "#53CBC9",
  coingeckoID: "matic-network",
  // NFTHandler: rarible,
  assetsHandler: tokenbalanceMew,
};

const matic = new EvmNetwork(maticOptions);

export default matic;
