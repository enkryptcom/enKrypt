import { KnownTokenDisplay } from "@/providers/polkadot/types";

const assets: KnownTokenDisplay[] = [
  {
    name: "Acala",
    symbol: "ACA",
    coingeckoID: "acala",
    icon: require("./icons/ACA.png"),
  },
  {
    name: "Polkadot",
    symbol: "DOT",
    coingeckoID: "polkadot",
    icon: require("../../icons/polkadot.svg"),
  },
  {
    name: "Crowdloan DOT",
    symbol: "lcDOT",
    coingeckoID: "polkadot",
    icon: require("./icons/LCDOT.png"),
  },
  {
    name: "Acala Dollar",
    symbol: "aUSD",
    icon: require("./icons/AUSD.png"),
    coingeckoID: "acala-dollar",
  },
  {
    name: "Liquid DOT",
    symbol: "LDOT",
    icon: require("./icons/LDOT.png"),
  },
];

export default assets;
