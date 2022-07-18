import { NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import tokensHandler from "@/providers/ethereum/libs/assets-handlers/token-mew";
import mewNFTHandler from "@/libs/nft-handlers/mew";

const ethOptions: EvmNetworkOptions = {
  name: NetworkNames.Ethereum,
  name_long: "Ethereum",
  homePage: "https://ethereum.org",
  blockExplorerTX: "https://www.ethvm.com/tx/[[txHash]]",
  blockExplorerAddr: "https://www.ethvm.com/address/[[address]]",
  chainID: 1,
  isTestNetwork: false,
  currencyName: "ETH",
  node: "wss://nodes.mewapi.io/ws/eth",
  icon: require("./icons/eth.svg"),
  gradient: "#8247E5",
  coingeckoID: "ethereum",
  NFTHandler: mewNFTHandler,
  assetsInfoHandler,
  tokensHandler,
};

const eth = new EvmNetwork(ethOptions);

export default eth;
