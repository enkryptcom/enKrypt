import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";

const ropOptions: EvmNetworkOptions = {
  name: NetworkNames.Ropsten,
  name_long: "Ropsten",
  homePage: "https://github.com/ethereum/ropsten",
  blockExplorerTX: "https://ropsten.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://ropsten.etherscan.io/address/[[address]]",
  chainID: 3,
  isTestNetwork: true,
  currencyName: "ROP",
  node: "wss://nodes.mewapi.io/ws/rop",
  icon: require("./icons/eth.svg"),
  basePath: "m/44'/1'/0'/0",
  gradient: "#E6007A",
};

const rop = new EvmNetwork(ropOptions);

export default rop;
