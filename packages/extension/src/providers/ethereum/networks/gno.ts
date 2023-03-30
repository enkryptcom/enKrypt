import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import { EtherscanActivity } from "../libs/activity-handlers";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import shNFTHandler from "@/libs/nft-handlers/simplehash";

const gnoOptions: EvmNetworkOptions = {
  name: NetworkNames.Gnosis,
  name_long: "Gnosis",
  homePage: "https://www.gnosis.io/",
  blockExplorerTX: "https://gnosisscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://gnosisscan.io/address/[[address]]",
  chainID: "0x64",
  isTestNetwork: false,
  currencyName: "DAI",
  currencyNameLong: "DAI",
  node: "https://rpc.gnosischain.com",
  icon: require("./icons/gno.svg"),
  gradient: "linear-gradient(180deg, #C549FF 0%, #684CFF 100%)",
  coingeckoID: "dai",
  coingeckoPlatform: CoingeckoPlatform.Gnosis,
  assetsInfoHandler,
  NFTHandler: shNFTHandler,
  activityHandler: wrapActivityHandler(EtherscanActivity),
};

const gno = new EvmNetwork(gnoOptions);

export default gno;
