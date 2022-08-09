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
    icon: require("../../icons/polkadot.svg"),
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
  new AcalaOrmlAsset({
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    icon: require("./icons/ETH.svg"),
    coingeckoID: "ethereum",
    assetType: "foreignAsset",
    lookupValue: 6,
    existentialDeposit: toBN("500000000000000"),
  }),
  new AcalaOrmlAsset({
    name: "Tapio",
    symbol: "TAP",
    decimals: 12,
    icon: require("./icons/TAP.png"),
    assetType: "token",
    lookupValue: "TAP",
    existentialDeposit: toBN("1000000000000"),
  }),
  new AcalaOrmlAsset({
    name: "Tapio DOT",
    symbol: "tDOT",
    icon: require("./icons/TDOT.png"),
    decimals: 10,
    existentialDeposit: toBN("100000000"),
    assetType: "stableAssetPoolToken",
    lookupValue: 0,
  }),
];

export default assets;
