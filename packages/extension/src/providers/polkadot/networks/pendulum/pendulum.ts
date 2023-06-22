import { NetworkNames } from "@enkryptcom/types";
import { toBN } from "web3-utils";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../../types/substrate-network";
import assets from "./assets/pendulum-assets";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const pendulumOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Pendulum,
  name_long: "Pendulum",
  homePage: "https://pendulumchain.org",
  blockExplorerTX: "https://polkaholic.io/tx/[[txHash]]",
  blockExplorerAddr: "https://polkaholic.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "PEN",
  currencyNameLong: "Pendulum",
  coingeckoID: "pendulum-chain",
  icon: require("../icons/pendulum.svg"),
  decimals: 12,
  prefix: 56,
  gradient: "#E6007A",
  node: "wss://rpc-pendulum.prd.pendulumchain.tech",
  genesisHash:
    "0x5d3c298622d5634ed019bf61ea4b71655030015bde9beb0d6a24743714462c86",
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
  existentialDeposit: toBN("1000000000000"),
  knownTokens: assets,
};

const pendulum = new SubstrateNetwork(pendulumOptions);

export default pendulum;
