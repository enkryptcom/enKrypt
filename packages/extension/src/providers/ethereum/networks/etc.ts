import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";

const etcOptions: EvmNetworkOptions = {
  name: NetworkNames.EthereumClassic,
  name_long: "Ethereum Classic",
  homePage: "https://ethereumclassic.org/",
  blockExplorerTX: "https://blockscout.com/etc/mainnet/tx/[[txHash]]",
  blockExplorerAddr: "https://blockscout.com/etc/mainnet/address/[[address]]",
  chainID: 61,
  isTestNetwork: false,
  currencyName: "ETC",
  node: "wss://nodes.mewapi.io/ws/etc",
  icon: require("./icons/etc.svg"),
  gradient: "#53CBC9",
  basePath: "m/44'/61'/0'/0",
  coingeckoID: "ethereum-classic",
};

const etc = new EvmNetwork(etcOptions);

export default etc;
