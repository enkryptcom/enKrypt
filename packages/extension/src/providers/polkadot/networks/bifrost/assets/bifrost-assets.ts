import { KnownTokenDisplay } from "@/providers/polkadot/types";

const assets: KnownTokenDisplay[] = [
  {
    name: "Bifrost",
    symbol: "BNC",
    coingeckoID: "bifrost-native-coin",
    icon: require("./icons/BNC.png"),
  },
  {
    name: "Polkadot",
    symbol: "DOT",
    coingeckoID: "polkadot",
    icon: require("../../icons/polkadot.svg"),
  },
  {
    name: "Kusama",
    symbol: "KSM",
    coingeckoID: "kusama",
    icon: require("../../icons/kusama.svg"),
  },
  {
    name: "Acala Dollar",
    symbol: "aUSD",
    icon: require("./icons/AUSD.png"),
    coingeckoID: "acala-dollar",
  },
  {
    name: "Moonriver",
    symbol: "MOVR",
    icon: require("./icons/MOVR.png"),
    coingeckoID: "moonriver",
  },
  {
    name: "Karura",
    symbol: "KAR",
    icon: require("./icons/KAR.png"),
    coingeckoID: "karura",
  },
  {
    name: "RMRK",
    symbol: "RMRK",
    icon: require("./icons/RMRK.png"),
    coingeckoID: "rmrk",
  },
  {
    name: "Zenlink",
    symbol: "ZLK",
    icon: require("./icons/ZLK.png"),
    coingeckoID: "zenlink-network-token",
  },
  {
    name: "USDT",
    symbol: "USDT",
    icon: require("./icons/USDT.png"),
    coingeckoID: "usdt",
  },
  {
    name: "Turing Network",
    symbol: "TUR",
    icon: require("./icons/TUR.png"),
    coingeckoID: "",
  },
  {
    name: "Darwinia Crab",
    symbol: "CRAB",
    icon: require("./icons/CRAB.png"),
    coingeckoID: "",
  },
];

export default assets;
