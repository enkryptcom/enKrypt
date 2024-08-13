import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { EtherscanActivity } from "../libs/activity-handlers";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import shNFTHandler from "@/libs/nft-handlers/simplehash";

const rariOptions: EvmNetworkOptions = {
  name: NetworkNames.Rari,
  name_long: "Rari",
  homePage: "https://rarichain.org/",
  blockExplorerTX: "https://mainnet.explorer.rarichain.org/tx/[[txHash]]",
  blockExplorerAddr:
    "https://mainnet.explorer.rarichain.org/address/[[address]]",
  chainID: "0x52415249",
  isTestNetwork: false,
  currencyName: "ETH",
  currencyNameLong: "Rari ETH",
  node: "https://mainnet.rpc.rarichain.org/http",
  icon: require("./icons/rari.png"),
  NFTHandler: shNFTHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const rari = new EvmNetwork(rariOptions);

export default rari;
