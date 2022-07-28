import { DAppsItem } from "@/types/ui";

const dappList: DAppsItem[] = [
  {
    title: "Acala Platform",
    link: "https://apps.acala.network/",
    description: "The all-in-one DeFi hub of Polkadot",
    isFavorites: false,
    image: "https://acala.network/static/media/Acala%20Gradient.e027e8c0.svg",
  },
  {
    title: "Portal",
    link: "https://www.portalbridge.com/",
    description: "Cross chain token and NFT transfers",
    isFavorites: false,
    image: require("./assets/portal.svg"),
  },
  {
    title: "Polkadot.js",
    description: "An all in one utility for the Polkadot ecosystem",
    link: "https://polkadot.js.org/apps",
    isFavorites: false,
    image: "https://polkadot.js.org/docs/img/logo.svg",
  },
];
export default dappList;
