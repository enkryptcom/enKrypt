import { ProviderName } from "@/types/provider";
import { SignerType } from "@enkryptcom/types";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import API from "../libs/api";
import dot from "../libs/assets-handlers/dot";
import createIcon from "../libs/blockies";
import { PolkadotNodeType } from "../types";
const prefix = 2;
const dotNode: PolkadotNodeType = {
  name: "KSM",
  name_long: "Kusama",
  homePage: "https://kusama.network/",
  blockExplorerTX: "https://polkascan.io/kusama/transaction/[[txHash]]",
  blockExplorerAddr: "https://polkascan.io/kusama/account/[[address]]",
  isTestNetwork: false,
  currencyName: "KSM",
  icon: require("./icons/kusama.svg"),
  decimals: 12,
  prefix,
  signer: [SignerType.sr25519, SignerType.ed25519],
  gradient: "#82D359",
  node: "wss://kusama-rpc.polkadot.io/",
  displayAddress: (address: string) => polkadotEncodeAddress(address, prefix),
  provider: ProviderName.polkadot,
  coingeckoID: "kusama",
  identicon: createIcon,
  assetsHandler: dot,
  basePath: "//",
};
dotNode.api = async () => {
  const api = new API(dotNode.node, { decimals: dotNode.decimals });
  await api.init();
  return api;
};
export default dotNode;
