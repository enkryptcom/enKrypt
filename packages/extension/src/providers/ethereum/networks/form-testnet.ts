import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { RivetActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import shNFTHandler from "@/libs/nft-handlers/simplehash";

console.log("FORM TESTNET...");
const formTestnetOptions: EvmNetworkOptions = {
  name: NetworkNames.FormTestnet,
  name_long: "Form Testnettttttt",
  homePage: "https://docs.form.network",
  blockExplorerTX: "https://explorer.form.network/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.form.network/address/[[address]]",
  chainID: "0x20726",
  isTestNetwork: true,
  currencyName: "ETH",
  currencyNameLong: "Ethereu,",
  node: "wss://rpc.form.network/ws",
  icon: require("./icons/eth.svg"),
  //   NFTHandler: shNFTHandler,
  activityHandler: wrapActivityHandler(RivetActivity),
};

const formTestnet = new EvmNetwork(formTestnetOptions);

export default formTestnet;
