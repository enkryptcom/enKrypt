import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { toChecksumAddress } from "ethereumjs-util";
import { isAddress } from "web3-utils";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

const rootstockOptions: EvmNetworkOptions = {
  name: NetworkNames.Rootstock,
  name_long: NetworkNames.Rootstock,
  homePage: "https://rsk.co/",
  blockExplorerTX: "https://explorer.rsk.co/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.rsk.co/address/[[address]]",
  chainID: "0x1e",
  isTestNetwork: false,
  currencyName: "RBTC",
  currencyNameLong: "Rootstock",
  node: "wss://public-node.rsk.co/websocket",
  icon: require("./icons/rootstock.svg"),
  basePath: "m/44'/137'/0'/0",
  gradient: "#7B3FE4",
  coingeckoID: CoingeckoPlatform.Rootstock,
  coingeckoPlatform: CoingeckoPlatform.Rootstock,
  activityHandler: wrapActivityHandler(EtherscanActivity),
  assetsInfoHandler,
};

rootstockOptions.displayAddress = (address: string) => {
  return toChecksumAddress(address, rootstockOptions.chainID);
};
rootstockOptions.isAddress = (address: string) => {
  return isAddress(address, parseInt(rootstockOptions.chainID));
};

const rootstock = new EvmNetwork(rootstockOptions);

export default rootstock;
