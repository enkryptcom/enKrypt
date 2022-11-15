import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

const sdnOptions: EvmNetworkOptions = {
  name: NetworkNames.ShidenEVM,
  name_long: "Shiden EVM",
  homePage: "https://shiden.astar.network/",
  blockExplorerTX: "https://blockscout.com/shiden/tx/[[txHash]]",
  blockExplorerAddr: "https://blockscout.com/shiden/address/[[address]]",
  chainID: "0x150",
  isTestNetwork: false,
  currencyName: "SDN",
  currencyNameLong: "Shiden",
  node: "wss://shiden.public.blastapi.io",
  icon: require("./icons/sdn.png"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  coingeckoID: "shiden",
  coingeckoPlatform: CoingeckoPlatform.Shiden,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const sdn = new EvmNetwork(sdnOptions);

export default sdn;
