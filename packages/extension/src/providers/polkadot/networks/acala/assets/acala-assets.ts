import { SubstrateNativeToken } from "@/providers/polkadot/types/substrate-native-token";
import { BaseToken } from "@/types/base-token";
import { toBN } from "web3-utils";
import { AcalaOrmlAsset } from "../types/acala-orml-asset";

const assets: BaseToken[] = [
  new SubstrateNativeToken({
    name: "Acala",
    symbol: "ACA",
    coingeckoID: "acala",
    icon: require("./icons/ACA.png"),
    decimals: 12,
    existentialDeposit: toBN("100000000000"),
  }),
  new AcalaOrmlAsset({
    name: "Polkadot",
    symbol: "DOT",
    coingeckoID: "polkadot",
    icon: require("./icons/DOT.png"),
    decimals: 10,
    assetType: "token",
    lookupValue: "DOT",
    existentialDeposit: toBN("100000000"),
  }),
  new AcalaOrmlAsset({
    name: "Crowdloan DOT",
    symbol: "lcDOT",
    coingeckoID: "polkadot",
    icon: require("./icons/LCDOT.png"),
    decimals: 10,
    assetType: "liquidCrowdloan",
    lookupValue: 13,
    existentialDeposit: toBN("100000000"),
  }),
  new AcalaOrmlAsset({
    name: "Acala Dollar",
    symbol: "AUSD",
    decimals: 12,
    icon: require("./icons/AUSD.png"),
    coingeckoID: "usd-coin",
    assetType: "token",
    lookupValue: "aUSD",
    existentialDeposit: toBN("100000000000"),
  }),
  new AcalaOrmlAsset({
    name: "Liquid DOT",
    symbol: "LDOT",
    decimals: 10,
    icon: require("./icons/LDOT.png"),
    coingeckoID: "polkadot",
    assetType: "token",
    lookupValue: "LDOT",
    existentialDeposit: toBN("500000000"),
  }),
];

export default assets;
