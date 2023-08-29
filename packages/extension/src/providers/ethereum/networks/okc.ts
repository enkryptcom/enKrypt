import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { OkcActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

const okcOptions: EvmNetworkOptions = {
  name: NetworkNames.Okc,
  name_long: "OKX Chain",
  homePage: "https://www.oklink.com/en/okc",
  blockExplorerTX: "https://www.oklink.com/en/okc/tx/[[txHash]]",
  blockExplorerAddr: "https://www.oklink.com/en/okc/address/[[address]]",
  chainID: "0x42",
  isTestNetwork: false,
  currencyName: "OKT",
  currencyNameLong: "OKX Chain",
  node: "https://exchainrpc.okex.org",
  icon: require("./icons/okc.svg"),
  coingeckoID: "oec-token",
  coingeckoPlatform: CoingeckoPlatform.Okc,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(OkcActivity),
};

const okc = new EvmNetwork(okcOptions);

export default okc;
