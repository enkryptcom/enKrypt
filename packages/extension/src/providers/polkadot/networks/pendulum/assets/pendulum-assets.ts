import { KnownTokenDisplay } from "@/providers/polkadot/types";

const assets: KnownTokenDisplay[] = [
  {
    name: "Pendulum",
    symbol: "PEN",
    coingeckoID: "pendulum",
    icon: require("../icons/PEN.png"),
  },
  {
    name: "Amplitude",
    symbol: "AMPE",
    icon: require("../icons/AMPE.png"),
  },
  {
    name: "Polkadot",
    symbol: "DOT",
    coingeckoID: "polkadot",
    icon: require("../../icons/polkadot.svg"),
  },
  {
    name: "Kusama",
    symbol: "KSM",
    coingeckoID: "kusama",
    icon: require("../../icons/kusama.svg"),
  },
];

export default assets;
