import { NetworkNames } from "@enkryptcom/types";
import { KadenaNetwork, KadenaNetworkOptions } from "../types/kadena-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { kadenaScanActivity } from "../libs/activity-handlers";

const kadenaOptions: KadenaNetworkOptions = {
  name: NetworkNames.KadenaTestnet,
  name_long: "Kadena Testnet",
  homePage: "https://kadena.io/",
  blockExplorerTX: "https://explorer.chainweb.com/testnet/tx/[[txHash]]",
  blockExplorerAddr:
    "https://explorer.chainweb.com/testnet/account/[[address]]?token=coin",
  isTestNetwork: true,
  currencyName: "KDA",
  currencyNameLong: "Kadena",
  icon: require("./icons/kadena-kda-logo.svg"),
  decimals: 12,
  prefix: 0,
  node: "https://api.testnet.chainweb.com/chainweb/0.0",
  kadenaApiOptions: {
    networkId: "testnet04",
    chainId: "1",
  },
  activityHandler: wrapActivityHandler(kadenaScanActivity),
  displayAddress: (address: string) => address.replace("0x", "k:"),
};

const kadenaTestnet = new KadenaNetwork(kadenaOptions);

export default kadenaTestnet;
