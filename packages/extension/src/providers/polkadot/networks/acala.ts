import { ProviderName } from "@/types/provider";
import { SignerType } from "@enkryptcom/types";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import API from "../libs/api";
import { PolkadotNodeType } from "../types";
const acaNode: PolkadotNodeType = {
  name: "ACA",
  name_long: "Acala",
  homePage: "https://acala.network/",
  blockExplorerTX: "https://acala.subscan.io/extrinsic/[[txHash]]",
  blockExplorerAddr: "https://acala.subscan.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "ACA",
  icon: require("./icons/polkadot.svg"),
  decimals: 12,
  prefix: 10,
  signer: [SignerType.sr25519, SignerType.ed25519],
  gradient: "#53CBC9",
  node: "wss://acala-rpc-0.aca-api.network/",
  displayAddress: (address: string) => polkadotEncodeAddress(address, 10),
  provider: ProviderName.polkadot,
  coingeckoID: "acala",
};
acaNode.api = async () => {
  const api = new API(acaNode.node, { decimals: acaNode.decimals });
  await api.init();
  return api;
};
export default acaNode;
