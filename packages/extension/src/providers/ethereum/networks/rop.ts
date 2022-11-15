import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { RivetActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const ropOptions: EvmNetworkOptions = {
  name: NetworkNames.Ropsten,
  name_long: "Ropsten",
  homePage: "https://github.com/ethereum/ropsten",
  blockExplorerTX: "https://ropsten.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://ropsten.etherscan.io/address/[[address]]",
  chainID: "0x3",
  isTestNetwork: true,
  currencyName: "ROP",
  currencyNameLong: "Ropsten",
  node: "wss://nodes.mewapi.io/ws/rop",
  icon: require("./icons/eth.svg"),
  basePath: "m/44'/1'/0'/0",
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  activityHandler: wrapActivityHandler(RivetActivity),
};

const rop = new EvmNetwork(ropOptions);

export default rop;
