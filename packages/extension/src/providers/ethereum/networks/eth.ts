import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import tokenbalanceMew from "@/providers/ethereum/libs/assets-handlers/tokenbalance-mew";

const ethOptions: EvmNetworkOptions = {
  name: NetworkNames.Ethereum,
  name_long: "Ethereum",
  homePage: "https://ethereum.org",
  blockExplorerTX: "https://etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://etherscan.io/address/[[address]]",
  chainID: 1,
  isTestNetwork: false,
  currencyName: "ETH",
  node: "wss://nodes.mewapi.io/ws/eth",
  icon: require("./icons/eth.svg"),
  gradient: "#8247E5",
  coingeckoID: "ethereum",
  assetsHandler: tokenbalanceMew,
};

const eth = new EvmNetwork(ethOptions);

export default eth;
