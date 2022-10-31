import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const opOptions: EvmNetworkOptions = {
  name: NetworkNames.Optimism,
  name_long: "Optimism",
  homePage: "https://www.optimism.io/",
  blockExplorerTX: "https://optimistic.etherscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://optimistic.etherscan.io/address/[[address]]",
  chainID: 10,
  isTestNetwork: false,
  currencyName: "ETH",
  currencyNameLong: "Ethereum",
  node: "https://mainnet.optimism.io",
  icon: require("./icons/op.svg"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  coingeckoID: "ethereum",
  coingeckoPlatform: CoingeckoPlatform.Optimism,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const op = new EvmNetwork(opOptions);

export default op;
