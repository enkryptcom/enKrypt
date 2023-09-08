import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { KadenaNetwork, KadenaNetworkOptions } from "../types/kadena-network";

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
  decimals: 18,
  prefix: 0,
  node: "https://us-e1.chainweb.com/",
  coingeckoID: "kadena",
  coingeckoPlatform: CoingeckoPlatform.Kadena,
};

const kadena = new KadenaNetwork(kadenaOptions);

export default kadena;
