import { ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import API from "../libs/api";
import dot from "../libs/assets-handlers/dot";
import createIcon from "../libs/blockies";
import { PolkadotNodeType } from "../types";
const prefix = 0;
const wndNode: PolkadotNodeType = {
  name: NetworkNames.Westend,
  name_long: "Westend",
  homePage: "https://polkadot.network",
  blockExplorerTX: "https://westend.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://westend.subscan.io/extrinsic/[[address]]",
  isTestNetwork: true,
  currencyName: "WND",
  icon: require("./icons/westend.svg"),
  decimals: 10,
  prefix,
  signer: [SignerType.sr25519, SignerType.ed25519],
  gradient: "#8247E5",
  node: "wss://rpc.pinknode.io/westend/explorer",
  displayAddress: (address: string) => polkadotEncodeAddress(address, prefix),
  provider: ProviderName.polkadot,
  identicon: createIcon,
  assetsHandler: dot,
  basePath: "//",
};
wndNode.api = async () => {
  const api = new API(wndNode.node, { decimals: wndNode.decimals });
  await api.init();
  return api;
};
export default wndNode;
