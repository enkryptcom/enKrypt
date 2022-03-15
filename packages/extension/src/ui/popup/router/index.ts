import { createRouter, createWebHashHistory } from "vue-router";
import Intro from "../views/intro/index.vue";
import AddNetwork from "../views/add-network/index.vue";
import NetworkActivity from "../views/network-activity/index.vue";
import NetworkAssets from "../views/network-assets/index.vue";
import NetworkDApps from "../views/network-dapps/index.vue";
import NetworkNFTs from "../views/network-nfts/index.vue";

const routes = [
  {
    path: "/",
    components: {
      view: Intro,
    },
    name: "intro",
  },
  {
    path: "/activity/:id?",
    components: {
      view: NetworkActivity,
    },
    name: "activity",
  },
  {
    path: "/assets/:id?",
    components: {
      view: NetworkAssets,
    },
    name: "assets",
  },
  {
    path: "/dapps/:id?",
    components: {
      view: NetworkDApps,
    },
    name: "dapps",
  },
  {
    path: "/nfts/:id?",
    components: {
      view: NetworkNFTs,
    },
    name: "nfts",
  },
  {
    path: "/add-network",
    components: {
      view: AddNetwork,
    },
    name: "add-network",
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
