import { createRouter, createWebHashHistory } from "vue-router";
import AddNetwork from "@action/views/add-network/index.vue";
import NetworkActivity from "@action/views/network-activity/index.vue";
import NetworkAssets from "@action/views/network-assets/index.vue";
import NetworkDApps from "@action/views/network-dapps/index.vue";
import NetworkNFTs from "@action/views/network-nfts/index.vue";
import LockScreen from "@action/views/lock-screen/index.vue";
import Intro from "@action/views/intro/index.vue";
import Swap from "@action/views/swap/index.vue";
import SwapBestOffer from "@action/views/swap/views/swap-best-offer/index.vue";
import VerifyTransaction from "@action/views/verify-transaction/index.vue";
import SendTransaction from "@action/views/send-transaction/index.vue";

const routes = {
  intro: {
    path: "/",
    components: {
      view: Intro,
    },
    name: "intro-screen",
  },
  locked: {
    path: "/locked",
    components: {
      view: LockScreen,
    },
    name: "lock-screen",
  },
  activity: {
    path: "/activity/:id?",
    components: {
      view: NetworkActivity,
    },
    name: "activity",
  },
  assets: {
    path: "/assets/:id?",
    components: {
      view: NetworkAssets,
    },
    name: "assets",
  },
  dapps: {
    path: "/dapps/:id?",
    components: {
      view: NetworkDApps,
    },
    name: "dapps",
  },
  nfts: {
    path: "/nfts/:id?",
    components: {
      view: NetworkNFTs,
    },
    name: "nfts",
  },
  send: {
    path: "/send/:id?",
    components: {
      view: SendTransaction,
    },
    name: "send-transaction",
  },
  verify: {
    path: "/verify-transaction/:id?",
    components: {
      view: VerifyTransaction,
    },
    name: "verify-transaction",
  },
  swap: {
    path: "/swap/:id?",
    components: {
      view: Swap,
    },
    name: "swap",
  },
  swapBestOffer: {
    path: "/swap-best-offer/:id?",
    components: {
      view: SwapBestOffer,
    },
    name: "swap-best-offer",
  },
  swapBestOfferHW: {
    path: "/swap-best-offer-hw/:id?",
    component: SwapBestOffer,
    name: "swap-best-offer-hw",
  },
  addNetwork: {
    path: "/add-network",
    components: {
      view: AddNetwork,
    },
    name: "add-network",
  },
};

export default createRouter({
  history: createWebHashHistory(),
  routes: Object.values(routes),
});

export { routes };
