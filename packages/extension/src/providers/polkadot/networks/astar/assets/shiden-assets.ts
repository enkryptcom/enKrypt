import { KnownTokenDisplay } from "@/providers/polkadot/types";

const assets: KnownTokenDisplay[] = [
  {
    name: "Moonriver",
    symbol: "MOVR",
    coingeckoID: "moonriver",
    icon: require("./icons/MOVR.png"),
  },
  {
    name: "Kusama",
    symbol: "KSM",
    icon: require("./icons/KSM.png"),
  },
  {
    name: "Liquid Kusama",
    symbol: "LKSM",
    icon: require("./icons/LKSM.png"),
  },
  {
    name: "Acala Dollar",
    symbol: "aUSD",
    icon: require("./icons/AUSD.png"),
    coingeckoID: "acala-dollar",
  },
  {
    name: "Karura",
    symbol: "KAR",
    icon: require("./icons/KAR.svg"),
  },
];

export default assets;
