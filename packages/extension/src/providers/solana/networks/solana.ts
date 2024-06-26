import { NetworkNames } from "@enkryptcom/types";
import { SolanaNetwork, SolanaNetworkOptions } from "../types/sol-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const solanaOptions: SolanaNetworkOptions = {
  name: NetworkNames.Solana,
  name_long: "Solana",
  homePage: "https://solana.com/",
  blockExplorerTX: "https://solscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://solscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "SOL",
  currencyNameLong: "Solana",
  icon: require("./icons/sol.svg"),
  decimals: 8,
  node: "https://node.mewapi.io/ws/sol",
  coingeckoID: "solana",
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
  basePath: "m/44'/501'",
};

const bitcoin = new SolanaNetwork(solanaOptions);

export default bitcoin;
