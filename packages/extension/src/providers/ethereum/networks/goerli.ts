import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";

const goerliOptions: EvmNetworkOptions = {
  name: NetworkNames.Goerli,
  name_long: "Goerli",
  homePage: "https://github.com/goerli/testnet",
  blockExplorerTX: "https://goerli.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://goerli.etherscan.io/address/[[address]]",
  chainID: 5,
  isTestNetwork: false,
  currencyName: "GöETH",
  node: "wss://nodes.mewapi.io/ws/goerli",
  icon: require("./icons/eth.svg"),
  gradient: "#C4C4C4",
  coingeckoID: "ethereum",
};

const goerli = new EvmNetwork(goerliOptions);

export default goerli;
