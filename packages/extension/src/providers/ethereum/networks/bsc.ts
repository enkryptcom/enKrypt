import { ProviderName } from "@/types/provider";
import { SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import API from "../libs/api";
import { EthereumNodeType } from "../types";
import createIcon from "../libs/blockies";
import tokenbalanceMew from "@/providers/ethereum/libs/assets-handlers/tokenbalance-mew";
const bscNode: EthereumNodeType = {
  name: "BNB",
  name_long: "BNB Chain",
  homePage: "https://www.binance.org/en/smartChain",
  blockExplorerTX: "https://bscscan.com/tx/[[txHash]]",
  blockExplorerAddr: "https://bscscan.com/address/[[address]]",
  chainID: 56,
  isTestNetwork: false,
  currencyName: "BNB",
  node: "wss://nodes.mewapi.io/ws/bsc",
  icon: require("./icons/bsc.svg"),
  signer: [SignerType.secp256k1],
  gradient: "#E6007A",
  displayAddress: (address: string) => toChecksumAddress(address),
  provider: ProviderName.ethereum,
  coingeckoID: "binancecoin",
  identicon: createIcon,
  assetsHandler: tokenbalanceMew,
  basePath: "m/44'/714'",
};
bscNode.api = async () => {
  const api = new API(bscNode.node);
  await api.init();
  return api;
};
export default bscNode;
