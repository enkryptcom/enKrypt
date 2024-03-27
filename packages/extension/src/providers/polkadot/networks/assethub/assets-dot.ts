import { KnownTokenDisplay } from "@/providers/polkadot/types";

const assets: KnownTokenDisplay[] = [
  {
    name: "USD Coin",
    symbol: "USDC",
    coingeckoID: "usd-coin",
    icon: require("./icons/usdc.png"),
    id: "1337",
  },
  {
    name: "Tether USD",
    symbol: "USDt",
    coingeckoID: "tether",
    icon: require("./icons/usdt.png"),
    id: "1984",
  },
  {
    name: "DOT is Dead",
    symbol: "DED",
    icon: require("./icons/ded.png"),
    id: "30",
  },
];

export default assets;
