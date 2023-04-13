import { KnownTokenDisplay } from "@/providers/polkadot/types";

const assets: KnownTokenDisplay[] = [
  {
    name: "Interlay",
    symbol: "INTR",
    coingeckoID: "interlay",
    icon: require("./icons/INTR.png"),
  },
  {
    name: "Kusama",
    symbol: "KSM",

    icon: require("./icons/KSM.png"),
    coingeckoID: "kusama",
  },
  {
    name: "Liquid KSM",
    symbol: "LKSM",
    icon: require("./icons/LKSM.png"),
  },
  {
    name: "USDT",
    symbol: "USDT",
    icon: require("./icons/USDT.png"),
    coingeckoID: "usdt",
  },
  {
    name: "KBTC",
    symbol: "KBTC",
    icon: require("./icons/KBTC.png"),
    coingeckoID: "kintsugi-btc",
  },
];

export default assets;
