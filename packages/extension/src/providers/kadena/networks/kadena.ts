import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { KadenaNetwork, KadenaNetworkOptions } from "../types/kadena-network";

const kadenaOptions: KadenaNetworkOptions = {
  name: NetworkNames.Kadena,
  name_long: "Kadena",
  homePage: "https://kadena.io/",
  blockExplorerTX: "https://polkadot.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://polkadot.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "KDA",
  currencyNameLong: "Kadena",
  icon: require("./icons/kadena-kda-logo.svg"),
  decimals: 18,
  prefix: 0,
  node: "wss://rpc.polkadot.io/",
  coingeckoID: "kadena",
  coingeckoPlatform: CoingeckoPlatform.Kadena,
};

const kadena = new KadenaNetwork(kadenaOptions);

export default kadena;
