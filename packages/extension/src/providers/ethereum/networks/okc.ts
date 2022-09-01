import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import mewNFTHandler from "@/libs/nft-handlers/mew";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const okcOptions: EvmNetworkOptions = {
  name: NetworkNames.Okc,
  name_long: "OKExchain",
  homePage: "https://www.oklink.com/zh-cn/okc",
  blockExplorerTX: "https://www.oklink.com/zh-cn/okc/tx/[[txHash]]",
  blockExplorerAddr: "https://www.oklink.com/zh-cn/okc/address/[[address]]",
  chainID: 66,
  isTestNetwork: false,
  currencyName: "OKT",
  node: "https://exchainrpc.okex.org",
  icon: require("./icons/okc.svg"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  coingeckoID: "oec-token",
  coingeckoPlatform: CoingeckoPlatform.Okc,
  NFTHandler: mewNFTHandler,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const okc = new EvmNetwork(okcOptions);

export default okc;
