import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { KadenaNetwork, KadenaNetworkOptions } from "../types/kadena-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { kadenaScanActivity } from "../libs/activity-handlers";

const kadenaOptions: KadenaNetworkOptions = {
  name: NetworkNames.Kadena,
  name_long: "Kadena",
  homePage: "https://kadena.io/",
  blockExplorerTX: "https://explorer.chainweb.com/mainnet/tx/[[txHash]]",
  blockExplorerAddr:
    "https://explorer.chainweb.com/mainnet/account/[[address]]?token=coin",
  isTestNetwork: false,
  currencyName: "KDA",
  currencyNameLong: "Kadena",
  icon: require("./icons/kadena-kda-logo.svg"),
  decimals: 8,
  prefix: 0,
  node: "https://api.chainweb.com/chainweb/0.0",
  kadenaApiOptions: {
    networkId: "mainnet01",
    chainId: "1",
  },
  coingeckoID: "kadena",
  coingeckoPlatform: CoingeckoPlatform.Kadena,
  activityHandler: wrapActivityHandler(kadenaScanActivity),
};

const kadena = new KadenaNetwork(kadenaOptions);

export default kadena;
