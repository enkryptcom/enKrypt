import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import mewNFTHandler from "@/libs/nft-handlers/mew";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const ethOptions: EvmNetworkOptions = {
  name: NetworkNames.Ethereum,
  name_long: "Ethereum",
  homePage: "https://ethereum.org",
  blockExplorerTX: "https://www.ethvm.com/tx/[[txHash]]",
  blockExplorerAddr: "https://www.ethvm.com/address/[[address]]",
  chainID: "0x1",
  isTestNetwork: false,
  currencyName: "ETH",
  currencyNameLong: "Ethereum",
  node: "wss://nodes.mewapi.io/ws/eth",
  icon: require("./icons/eth.svg"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  coingeckoID: "ethereum",
  coingeckoPlatform: CoingeckoPlatform.Ethereum,
  NFTHandler: mewNFTHandler,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const eth = new EvmNetwork(ethOptions);

export default eth;
