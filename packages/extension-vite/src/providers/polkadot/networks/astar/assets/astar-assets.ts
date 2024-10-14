import { KnownTokenDisplay } from "@/providers/polkadot/types";

const assets: KnownTokenDisplay[] = [
  {
    name: "Acala",
    symbol: "ACA",
    coingeckoID: "acala",
    icon: require("./icons/ACA.png"),
    id: "18446744073709551616",
  },
  {
    name: "Polkadot",
    symbol: "DOT",
    coingeckoID: "polkadot",
    icon: require("../../icons/polkadot.svg"),
    id: "340282366920938463463374607431768211455",
  },
  {
    name: "Liquid DOT",
    symbol: "LDOT",
    icon: require("./icons/LDOT.png"),
    id: "18446744073709551618",
  },
];

export default assets;
