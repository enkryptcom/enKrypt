import { NetworkNames } from "@enkryptcom/types";
import BigNumber from "bignumber.js";
import { SubstrateNativeToken } from "../types/substrate-native-token";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../types/substrate-network";

const ksmOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Kusama,
  name_long: "Kusama",
  homePage: "https://kusama.network/",
  blockExplorerTX: "https://polkascan.io/kusama/transaction/[[txHash]]",
  blockExplorerAddr: "https://polkascan.io/kusama/account/[[address]]",
  isTestNetwork: false,
  currencyName: "KSM",
  icon: require("./icons/kusama.svg"),
  decimals: 12,
  prefix: 2,
  gradient: "#82D359",
  node: "wss://kusama-rpc.polkadot.io/",
  coingeckoID: "kusama",
  genesisHash:
    "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",
};

const ksm = new SubstrateNetwork(ksmOptions);

const nativeAsset = new SubstrateNativeToken({
  name: "Kusama",
  symbol: "KSM",
  coingeckoID: "kusama",
  icon: "",
  decimals: 12,
  existentialDeposit: new BigNumber("33333300"),
});

ksm.assets = [nativeAsset];

export default ksm;
