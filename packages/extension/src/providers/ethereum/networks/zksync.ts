import { NetworkNames, CoingeckoPlatform } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { EtherscanActivity } from "../libs/activity-handlers";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

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
  node: "https://zksync2-mainnet.zksync.io",
  icon: require("./icons/zksync.svg"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  coingeckoID: "ethereum",
  coingeckoPlatform: CoingeckoPlatform.Zksync,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const zksync = new EvmNetwork(zkSyncOptions);

export default zksync;
