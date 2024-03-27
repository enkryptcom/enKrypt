import { KnownTokenDisplay } from "@/providers/polkadot/types";

const assets: KnownTokenDisplay[] = [
  {
    name: "RMRK.app",
    symbol: "RMRK",
    coingeckoID: "rmrk",
    icon: require("./icons/rmrk.png"),
    id: "8",
  },
  {
    name: "Tether USD",
    symbol: "USDt",
    coingeckoID: "tether",
    icon: require("./icons/usdt.png"),
    id: "1984",
  },
];

export default assets;
