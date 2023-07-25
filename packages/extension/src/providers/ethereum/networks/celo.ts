import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

const celoOptions: EvmNetworkOptions = {
  name: NetworkNames.Celo,
  name_long: "Celo",
  homePage: "https://celo.org/",
  blockExplorerTX: "https://explorer.celo.org/mainnet/tx/[[txHash]]",
  blockExplorerAddr: "https://explorer.celo.org/mainnet/address/[[address]]",
  chainID: "0xa4ec",
  isTestNetwork: false,
  currencyName: "CELO",
  currencyNameLong: "Celo",
  node: "https://forno.celo.org",
  icon: require("./icons/celo.svg"),
  coingeckoID: "celo",
  coingeckoPlatform: CoingeckoPlatform.Celo,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const celo = new EvmNetwork(celoOptions);

export default celo;
