import { KnownTokenDisplay } from "@/providers/polkadot/types";

const assets: KnownTokenDisplay[] = [
  {
    name: "Moonriver",
    symbol: "MOVR",
    coingeckoID: "moonriver",
    icon: require("./icons/MOVR.png"),
    id: "18446744073709551620",
  },
  {
    name: "Kusama",
    symbol: "KSM",
    icon: require("./icons/KSM.png"),
    id: "340282366920938463463374607431768211455",
  },
  {
    name: "Karura",
    symbol: "KAR",
    icon: require("./icons/KAR.svg"),
    id: "18446744073709551618",
  },
];

export default assets;
