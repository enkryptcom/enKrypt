import { AcalaTokenType } from "./types";

const supported: AcalaTokenType[] = [
  {
    name: "Acala",
    symbol: "ACA",
    decimals: 12,
    image: require("./icons/ACA.png"),
    coingeckoID: "acala",
    native: true,
  },
  {
    name: "Acala Dollar",
    symbol: "AUSD",
    decimals: 12,
    image: require("./icons/AUSD.png"),
    coingeckoID: "usd-coin",
  },
  {
    name: "Polkadot",
    symbol: "DOT",
    decimals: 10,
    image: require("./icons/DOT.png"),
    coingeckoID: "polkadot",
  },
  {
    name: "Liquid DOT",
    symbol: "LDOT",
    decimals: 10,
    image: require("./icons/LDOT.png"),
    coingeckoID: "polkadot",
  },
  {
    name: "Crowdloan DOT",
    symbol: "lcDOT",
    decimals: 10,
    image: require("./icons/LDOT.png"),
    crowdloanId: 13,
    coingeckoID: "polkadot",
  },
];
export default supported;
