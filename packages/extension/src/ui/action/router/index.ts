import { createRouter, createWebHashHistory } from "vue-router";
import Intro from "@popup/views/intro/index.vue";
import AddNetwork from "@popup/views/add-network/index.vue";
import NetworkActivity from "@popup/views/network-activity/index.vue";
import NetworkAssets from "@popup/views/network-assets/index.vue";
import NetworkDApps from "@popup/views/network-dapps/index.vue";
import NetworkNFTs from "@popup/views/network-nfts/index.vue";

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
