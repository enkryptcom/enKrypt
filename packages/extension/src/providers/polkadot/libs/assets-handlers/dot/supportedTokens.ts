import { TokenType } from "./types";

const supported: TokenType[] = [
  {
    name: "Polkadot",
    symbol: "DOT",
    decimals: 10,
    image: require("@/providers/polkadot/networks/icons/polkadot.svg"),
    coingeckoID: "polkadot",
  },
];
export default supported;
