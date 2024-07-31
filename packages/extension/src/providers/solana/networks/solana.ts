import { NetworkNames } from "@enkryptcom/types";
import { SolanaNetwork, SolanaNetworkOptions } from "../types/sol-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

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
  decimals: 9,
  node: "https://nodes.mewapi.io/rpc/sol",
  coingeckoID: "solana",
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
  basePath: "m/44'/501'",
  assetsInfoHandler,
};

const bitcoin = new SolanaNetwork(solanaOptions);

export default bitcoin;
