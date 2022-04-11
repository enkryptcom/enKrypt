<template>
  <div class="container">
    <add-network-header />
    <custom-scrollbar class="add-network__scroll-area" :settings="settings">
      <h3 class="add-network__list-header">Popular</h3>

      <add-network-item
        v-for="(item, index) in popular"
        :key="index"
        :network="item"
        :is-active="true"
      ></add-network-item>

      <h3 class="add-network__list-header">All networks</h3>

      <add-network-item
        v-for="(item, index) in all"
        :key="index"
        :network="item"
        :is-active="true"
      ></add-network-item>
    </custom-scrollbar>
  </div>
</template>

<script lang="ts">
export default {
  name: "AddNetwork",
};
</script>

<script setup lang="ts">
import AddNetworkHeader from "./components/add-network-header.vue";
import AddNetworkItem from "./components/add-network-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";

const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};
const popular = [
  {
    id: 1,
    title: "Ethereum",
    image: require("@/ui/action/icons/raw/eth-logo.png"),
  },
  {
    id: 2,
    title: "Polygon",
    image: require("@/ui/action/icons/raw/polygon-logo.png"),
  },
  {
    id: 3,
    title: "Polkadot",
    image: require("@/ui/action/icons/raw/polkadot.png"),
  },
  {
    id: 4,
    title: "Moonbeam",
    image: require("@/ui/action/icons/raw/moonbeam.png"),
  },
];
const all = [
  {
    id: 1,
    title: "Ethereum",
    image: require("@/ui/action/icons/raw/eth-logo.png"),
  },
  {
    id: 2,
    title: "Polygon",
    image: require("@/ui/action/icons/raw/polygon-logo.png"),
  },
  {
    id: 3,
    title: "Polkadot",
    image: require("@/ui/action/icons/raw/polkadot.png"),
  },
  {
    id: 4,
    title: "Moonbeam",
    image: require("@/ui/action/icons/raw/moonbeam.png"),
  },
  {
    id: 1,
    title: "Ethereum",
    image: require("@/ui/action/icons/raw/eth-logo.png"),
  },
  {
    id: 2,
    title: "Polygon",
    image: require("@/ui/action/icons/raw/polygon-logo.png"),
  },
  {
    id: 3,
    title: "Polkadot",
    image: require("@/ui/action/icons/raw/polkadot.png"),
  },
  {
    id: 4,
    title: "Moonbeam",
    image: require("@/ui/action/icons/raw/moonbeam.png"),
  },
];
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.container {
  width: 100%;
  height: 600px;
  overflow-x: hidden;
  overflow-y: scroll;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
}
.add-network {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__list {
    &-header {
      font-style: normal;
      font-weight: bold;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      margin: 8px 0 0 0;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 460px;
    margin: 8px 0 8px 0;
    padding: 0 32px !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }
}
</style>
