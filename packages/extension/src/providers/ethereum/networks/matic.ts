import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import tokensHandler from "@/providers/ethereum/libs/assets-handlers/token-mew";
import RaribleNFTHandler from "@/libs/nft-handlers/rarible";
import { EtherscanActivity } from "../libs/activity-handlers";

const maticOptions: EvmNetworkOptions = {
  name: NetworkNames.Matic,
  name_long: "Polygon (Matic)",
  homePage: "https://polygonscan.com/",
  blockExplorerTX: "https://polygonscan.com/tx/[[txHash]]",
  blockExplorerAddr: "https://polygonscan.com/address/[[address]]",
  chainID: 137,
  isTestNetwork: false,
  currencyName: "MATIC",
  node: "wss://nodes.mewapi.io/ws/matic",
  icon: require("./icons/matic.svg"),
  gradient: "#53CBC9",
  coingeckoID: "matic-network",
  NFTHandler: RaribleNFTHandler,
  assetsInfoHandler,
  tokensHandler,
  activityHandler: EtherscanActivity,
};

const matic = new EvmNetwork(maticOptions);

export default matic;
