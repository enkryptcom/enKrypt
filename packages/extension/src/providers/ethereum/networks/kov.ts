import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const kovOptions: EvmNetworkOptions = {
  name: NetworkNames.Kovan,
  name_long: "Kovan",
  homePage: "https://github.com/kovan-testnet",
  blockExplorerTX: "https://kovan.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://kovan.etherscan.io/address/[[address]]",
  chainID: "0x2a",
  isTestNetwork: true,
  currencyName: "KOV",
  currencyNameLong: "Kovan",
  node: "wss://nodes.mewapi.io/ws/kovan",
  icon: require("./icons/eth.svg"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const kov = new EvmNetwork(kovOptions);

export default kov;
