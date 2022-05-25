import { ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import API from "../libs/api";
import karuraAssetsHandler from "../libs/assets-handlers/karura";
import createIcon from "../libs/blockies";
import { PolkadotNodeType } from "../types";
const prefix = 8;
const karNode: PolkadotNodeType = {
  name: NetworkNames.Karura,
  name_long: "Karura",
  homePage: "https://karura.network/",
  blockExplorerTX: "https://karura.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://karura.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "KAR",
  icon: require("./icons/karura.svg"),
  decimals: 12,
  prefix,
  signer: [SignerType.sr25519, SignerType.ed25519],
  gradient: "#FF4C3B",
  node: "wss://karura.api.onfinality.io/public-ws",
  displayAddress: (address: string) => polkadotEncodeAddress(address, prefix),
  provider: ProviderName.polkadot,
  coingeckoID: "karura",
  identicon: createIcon,
  assetsHandler: karuraAssetsHandler,
  basePath: "//",
};
karNode.api = async () => {
  const api = new API(karNode.node, { decimals: karNode.decimals });
  await api.init();
  return api;
};
export default karNode;
