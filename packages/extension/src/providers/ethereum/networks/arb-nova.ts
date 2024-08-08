import { CoingeckoPlatform, NetworkNames } from "@enkryptcom/types";
import { EvmNetwork, EvmNetworkOptions } from "../types/evm-network";
import assetsInfoHandler from "@/providers/ethereum/libs/assets-handlers/assetinfo-mew";
import shNFTHandler from "@/libs/nft-handlers/simplehash";

const arbNovaOptions: EvmNetworkOptions = {
  name: NetworkNames.ArbitrumNova,
  name_long: "Arbitrum Nova",
  homePage: "https://arbitrum.io/",
  blockExplorerTX: "https://nova.arbiscan.io/tx/[[txHash]]",
  blockExplorerAddr: "https://nova.arbiscan.io/address/[[address]]",
  chainID: "0xa4ba",
  isTestNetwork: false,
  currencyName: "ETH",
  currencyNameLong: "Ethereum",
  node: "https://nova.arbitrum.io/rpc",
  icon: require("./icons/arbitrum-nova.png"),
  coingeckoID: "ethereum",
  coingeckoPlatform: CoingeckoPlatform.ArbitrumNova,
  assetsInfoHandler,
  NFTHandler: shNFTHandler,
  activityHandler: () => Promise.resolve([]),
};

const arb = new EvmNetwork(arbNovaOptions);

export default arb;
