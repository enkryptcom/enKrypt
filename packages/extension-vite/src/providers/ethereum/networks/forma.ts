import icon from "./icons/forma.png";
import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import shNFTHandler from "@/libs/nft-handlers/simplehash";

const formaOptions: EvmNetworkOptions = {
  name: NetworkNames.Forma,
  name_long: "Forma",
  homePage: "https://forma.art/",
  blockExplorerTX: "https://explorer.forma.art/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.forma.art/address/[[address]]",
  chainID: "0xf043a",
  isTestNetwork: false,
  currencyName: "TIA",
  currencyNameLong: "TIA",
  node: "https://rpc.forma.art",
  icon,
  activityHandler: wrapActivityHandler(EtherscanActivity),
  NFTHandler: shNFTHandler,
};

const forma = new EvmNetwork(formaOptions);

export default forma;
