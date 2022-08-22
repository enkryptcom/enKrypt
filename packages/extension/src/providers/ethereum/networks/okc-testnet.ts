import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import mewNFTHandler from "@/libs/nft-handlers/mew";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const okcOptions: EvmNetworkOptions = {
  name: NetworkNames.OkcTestnet,
  name_long: "OKExchainTest",
  homePage: "https://www.oklink.com/zh-cn/okc",
  blockExplorerTX: "https://www.oklink.com/zh-cn/okc-test/tx/[[txHash]]",
  blockExplorerAddr: "https://www.oklink.com/zh-cn/okc-test/address/[[address]]",
  chainID: 66,
  isTestNetwork: true,
  currencyName: "OKT",
  node: "https://exchaintestrpc.okex.org",
  icon: require("./icons/okc.svg"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  NFTHandler: mewNFTHandler,
  assetsInfoHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const okctest = new EvmNetwork(okcOptions);

export default okctest;
