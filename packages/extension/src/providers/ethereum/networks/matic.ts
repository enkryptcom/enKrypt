import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import RaribleNFTHandler from "@/libs/nft-handlers/rarible";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const maticOptions: EvmNetworkOptions = {
  name: NetworkNames.Matic,
  name_long: "Polygon (Matic)",
  homePage: "https://polygonscan.com/",
  blockExplorerTX: "https://polygonscan.com/tx/[[txHash]]",
  blockExplorerAddr: "https://polygonscan.com/address/[[address]]",
  chainID: "0x89",
  isTestNetwork: false,
  currencyName: "MATIC",
  currencyNameLong: "Polygon Matic",
  node: "wss://nodes.mewapi.io/ws/matic",
  icon: require("./icons/matic.svg"),
  gradient: "#7B3FE4",
  coingeckoID: "matic-network",
  coingeckoPlatform: CoingeckoPlatform.Matic,
  NFTHandler: RaribleNFTHandler,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const matic = new EvmNetwork(maticOptions);

export default matic;
