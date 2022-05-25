import { ProviderName } from "@/types/provider";
import { NetworkNames, SignerType } from "@enkryptcom/types";
import { toChecksumAddress } from "ethereumjs-util";
import API from "../libs/api";
import { EthereumNodeType } from "../types";
import createIcon from "../libs/blockies";
const karuraEvmNode: EthereumNodeType = {
  name: NetworkNames.KaruraEVM,
  name_long: "Karura EVM",
  homePage: "https://karura.network",
  blockExplorerTX: "https://blockscout.karura.network/tx/[[txHash]]",
  blockExplorerAddr: "https://blockscout.karura.network/address/[[address]]",
  chainID: 686,
  isTestNetwork: false,
  currencyName: "KAR",
  node: "https://eth-rpc-karura.aca-api.network/eth/http",
  icon: require("./icons/karura-evm.svg"),
  signer: [SignerType.secp256k1],
  gradient: "#FF4C3B",
  displayAddress: (address: string) => toChecksumAddress(address),
  provider: ProviderName.ethereum,
  coingeckoID: "karura",
  identicon: createIcon,
  basePath: "m/44'/60'/0'/0",
};
karuraEvmNode.api = async () => {
  const api = new API(karuraEvmNode.node);
  await api.init();
  return api;
};
export default karuraEvmNode;
