import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import shNFTHandler from "@/libs/nft-handlers/simplehash";

const arbOptions: EvmNetworkOptions = {
  name: NetworkNames.Arbitrum,
  name_long: "Arbitrum",
  homePage: "https://arbitrum.io/",
  blockExplorerTX: "https://arbiscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://arbiscan.io/address/[[address]]",
  chainID: "0xa4b1",
  isTestNetwork: false,
  currencyName: "ETH",
  currencyNameLong: "Ethereum",
  node: "wss://nodes.mewapi.io/ws/arb",
  icon: require("./icons/arbitrum.svg"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  coingeckoID: "ethereum",
  coingeckoPlatform: CoingeckoPlatform.Arbitrum,
  assetsInfoHandler,
  NFTHandler: shNFTHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const arb = new EvmNetwork(arbOptions);

export default arb;
