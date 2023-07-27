import { NetworkNames, CoingeckoPlatform } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { EtherscanActivity } from "../libs/activity-handlers";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import shNFTHandler from "@/libs/nft-handlers/simplehash";

const zkSyncOptions: EvmNetworkOptions = {
  name: NetworkNames.ZkSync,
  name_long: "zkSync Era",
  homePage: "https://zksync.io/",
  blockExplorerTX: "https://explorer.zksync.io/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.zksync.io/address/[[address]]",
  chainID: "0x144",
  isTestNetwork: false,
  currencyName: "ETH",
  currencyNameLong: "zkSync ETH",
  node: "wss://mainnet.era.zksync.io/ws",
  icon: require("./icons/zksync.svg"),
  coingeckoID: "ethereum",
  coingeckoPlatform: CoingeckoPlatform.Zksync,
  NFTHandler: shNFTHandler,
  assetsInfoHandler,

  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const zksync = new EvmNetwork(zkSyncOptions);

export default zksync;
