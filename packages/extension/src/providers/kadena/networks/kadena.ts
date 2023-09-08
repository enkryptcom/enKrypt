import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { KadenaNetwork, KadenaNetworkOptions } from "../types/kadena-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import { kadenaScanActivity } from "../libs/activity-handlers";

const kadenaOptions: KadenaNetworkOptions = {
  name: NetworkNames.Kadena,
  name_long: "Kadena",
  homePage: "https://kadena.io/",
  //https://explorer.chainweb.com/testnet/account/92a1c888ce9cdf77523934a1dfa697e161450500019dc0e44593aa1f7be7b720?token=coin
  blockExplorerTX: "https://explorer.chainweb.com/testnet/tx/[[txHash]]",
  blockExplorerAddr:
    "https://explorer.chainweb.com/testnet/account/[[address]]?token=coin",
  isTestNetwork: false,
  currencyName: "KDA",
  currencyNameLong: "Kadena",
  icon: require("./icons/kadena-kda-logo.svg"),
  decimals: 7,
  prefix: 0,
  node: "https://us-e1.chainweb.com/",
  coingeckoID: "kadena",
  coingeckoPlatform: CoingeckoPlatform.Kadena,
  activityHandler: wrapActivityHandler(kadenaScanActivity),
};

const kadena = new KadenaNetwork(kadenaOptions);

export default kadena;
