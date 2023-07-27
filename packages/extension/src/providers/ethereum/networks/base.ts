import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import shNFTHandler from "@/libs/nft-handlers/simplehash";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const baseOptions: EvmNetworkOptions = {
  name: NetworkNames.Base,
  name_long: "Base",
  homePage: "https://base.org",
  blockExplorerTX: "https://basescan.org/tx/[[txHash]]",
  blockExplorerAddr: "https://basescan.org/address/[[address]]",
  chainID: "0x2105",
  isTestNetwork: false,
  currencyName: "ETH",
  currencyNameLong: "Ethereum",
  node: "wss://nodes.mewapi.io/ws/base",
  icon: require("./icons/base.svg"),
  coingeckoID: "ethereum",
  coingeckoPlatform: CoingeckoPlatform.Base,
  NFTHandler: shNFTHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const base = new EvmNetwork(baseOptions);

export default base;
