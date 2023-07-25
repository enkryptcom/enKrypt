import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import shNFTHandler from "@/libs/nft-handlers/simplehash";

const maticOptions: EvmNetworkOptions = {
  name: NetworkNames.MaticZK,
  name_long: "Polygon | zkEVM",
  homePage: "https://zkevm.polygonscan.com/",
  blockExplorerTX: "https://zkevm.polygonscan.com/tx/[[txHash]]",
  blockExplorerAddr: "https://zkevm.polygonscan.com/address/[[address]]",
  chainID: "0x44d",
  isTestNetwork: false,
  currencyName: "MATIC",
  currencyNameLong: "Polygon Matic",
  node: "wss://nodes.mewapi.io/ws/maticzk",
  icon: require("./icons/matic.svg"),
  coingeckoID: "matic-network",
  coingeckoPlatform: CoingeckoPlatform.MaticZK,
  NFTHandler: shNFTHandler,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const matic = new EvmNetwork(maticOptions);

export default matic;
