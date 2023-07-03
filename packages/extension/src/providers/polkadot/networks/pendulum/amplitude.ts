import { NetworkNames } from "@enkryptcom/types";
import { toBN } from "web3-utils";
import {
  SubstrateNetwork,
  SubstrateNetworkOptions,
} from "../../types/substrate-network";
import assets from "./assets/pendulum-assets";
import wrapActivityHandler from "@/libs/activity-state/wrap-activity-handler";

const amplitudeOptions: SubstrateNetworkOptions = {
  name: NetworkNames.Amplitude,
  name_long: "Amplitude",
  homePage: "https://pendulumchain.org",
  blockExplorerTX: "https://polkaholic.io/tx/[[txHash]]",
  blockExplorerAddr: "https://polkaholic.io/account/[[address]]",
  isTestNetwork: false,
  currencyName: "AMPE",
  currencyNameLong: "Amplitude",
  coingeckoID: "amplitude",
  icon: require("../icons/amplitude.svg"),
  decimals: 12,
  prefix: 57,
  gradient: "#E6007A",
  node: "wss://rpc-amplitude.pendulumchain.tech",
  genesisHash:
    "0xcceae7f3b9947cdb67369c026ef78efa5f34a08fe5808d373c04421ecf4f1aaf",
  activityHandler: wrapActivityHandler(() => Promise.resolve([])),
  existentialDeposit: toBN("1000000000000"),
  knownTokens: assets,
};

const amplitude = new SubstrateNetwork(amplitudeOptions);

export default amplitude;
