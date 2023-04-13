import { KnownTokenDisplay } from "@/providers/polkadot/types";

const assets: KnownTokenDisplay[] = [
  {
    name: "Interlay",
    symbol: "INTR",
    coingeckoID: "interlay",
    icon: require("./icons/INTR.png"),
  },
  {
    name: "Polkadot",
    symbol: "DOT",
    coingeckoID: "polkadot",
    icon: require("../../icons/polkadot.svg"),
  },
  {
    name: "USDT",
    symbol: "USDT",
    icon: require("./icons/USDT.png"),
    coingeckoID: "usdt",
  },
  {
    name: "IBTC",
    symbol: "IBTC",
    icon: require("./icons/IBTC.png"),
    coingeckoID: "interbtc",
  },
];

export default assets;
