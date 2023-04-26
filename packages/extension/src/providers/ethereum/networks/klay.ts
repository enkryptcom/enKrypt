import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";

const klayOptions: EvmNetworkOptions = {
  name: NetworkNames.Klaytn,
  name_long: "Klaytn",
  homePage: "https://www.klaytn.foundation/",
  blockExplorerTX: "https://scope.klaytn.com/tx/[[txHash]]",
  blockExplorerAddr: "https://scope.klaytn.com/account/[[address]]",
  chainID: "0x2019",
  isTestNetwork: false,
  currencyName: "KLAY",
  currencyNameLong: "Klaytn",
  node: "https://public-en-cypress.klaytn.net",
  icon: require("./icons/klaytn.png"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  coingeckoID: "klay-token",
  coingeckoPlatform: CoingeckoPlatform.Klaytn,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
};

const klay = new EvmNetwork(klayOptions);

export default klay;
