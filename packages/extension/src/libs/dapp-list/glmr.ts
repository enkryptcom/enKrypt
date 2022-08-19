import { DAppsItem } from "@/types/ui";

const dappList: DAppsItem[] = [
  {
    title: "MEW",
    link: "https://www.myetherwallet.com/",
    description: "The original interface for all crypto has to offer.",
    isFavorites: false,
    image: require("./assets/mew.svg"),
  },
  {
    title: "StellaSwap",
    link: "https://app.stellaswap.com/exchange/swap",
    description:
      "StellaSwap is the first and leading Moonbeam DEX that offers an integrated gateway to the DeFi world",
    isFavorites: false,
    image:
      "https://dashboard-assets.dappradar.com/document/13814/stellaswap-dapp-defi-moonbeam-logo-166x166_e1d8b02f0e0ee6b7c0483723019bd677.png",
  },
  {
    title: "Beamswap",
    link: "https://app.beamswap.io/exchange/swap",
    description:
      "First Audited DEX on Moonbeam: DEX / AMM / Yield Farm / Bridge / Launchpad",
    isFavorites: false,
    image:
      "https://dashboard-assets.dappradar.com/document/13291/beamswap-dapp-exchanges-moonbeam-logo-166x166_b53d6773616930a38a4ecfbcfa6a7dfd.png",
  },
  {
    title: "Solarflare",
    link: "https://solarflare.io/exchange/swap",
    description: "Shine a light on DeFi, powering Moonbeam",
    isFavorites: false,
    image:
      "https://dashboard-assets.dappradar.com/document/13425/solarflare-dapp-exchanges-moonbeam-logo-166x166_cbf74e4ab169637c32727917c6e24847.png",
  },
  {
    title: "Beefy Finance",
    link: "https://app.beefy.com/",
    description:
      "The Multichain Yield Optimizer that autocompounds your crypto on BSC, Polygon, Fantom, HECO and Avalanche",
    isFavorites: false,
    image:
      "https://dashboard-assets.dappradar.com/document/4601/beefyfinance-dapp-defi-bsc-logo-166x166_153873cafb00fcab59e5f70dbce0c34a.png",
  },
  {
    title: "MoonBeans",
    link: "https://moonbeans.io/",
    description:
      "MoonBeans is one of the leading NFT marketplaces on Dotsama, providing the highest platform rewards available on the market!",
    isFavorites: false,
    image:
      "https://dashboard-assets.dappradar.com/document/13544/moonbeans-dapp-marketplaces-moonriver-logo-166x166_9d02ffa0e2df7be32435d03463828649.png",
  },
];
export default dappList;
