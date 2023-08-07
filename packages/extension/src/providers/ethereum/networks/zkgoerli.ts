import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { EtherscanActivity } from "../libs/activity-handlers";
import shNFTHandler from "@/libs/nft-handlers/simplehash";

const zkgoerliOptions: EvmNetworkOptions = {
  name: NetworkNames.ZkSyncGoerli,
  name_long: "zkSync Goerli",
  homePage: "https://zksync.io/",
  blockExplorerTX: "https://goerli.explorer.zksync.io/tx/[[txHash]]",
  blockExplorerAddr: "https://goerli.explorer.zksync.io/address/[[address]]",
  chainID: "0x118",
  isTestNetwork: true,
  currencyName: "GöETH",
  currencyNameLong: "zkSync Goerli",
  node: "wss://testnet.era.zksync.dev/ws",
  icon: require("./icons/zksync.svg"),
  NFTHandler: shNFTHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const zkgoerli = new EvmNetwork(zkgoerliOptions);

export default zkgoerli;
