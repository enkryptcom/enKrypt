import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EtherscanActivity } from "../libs/activity-handlers";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";

const karuraOptions: EvmNetworkOptions = {
  name: NetworkNames.KaruraEVM,
  name_long: "Karura EVM",
  homePage: "https://karura.network",
  blockExplorerTX: "https://blockscout.karura.network/tx/[[txHash]]",
  blockExplorerAddr: "https://blockscout.karura.network/address/[[address]]",
  chainID: "0x2ae",
  isTestNetwork: false,
  currencyName: "KAR",
  currencyNameLong: "Karura",
  node: "wss://eth-rpc-karura.aca-api.network/ws",
  icon: require("./icons/karura-evm.svg"),
  gradient: "linear-gradient(330.21deg, #E40C5B -26.31%, #FF4C3B 88.17%)",
  coingeckoID: "karura",
  coingeckoPlatform: CoingeckoPlatform.Karura,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const karura = new EvmNetwork(karuraOptions);

export default karura;
