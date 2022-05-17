<template>
  <div class="add-network__container">
    <div class="add-network__overlay" @click="close()"></div>
    <div class="add-network__wrap">
      <add-network-header :close="close" />
      <custom-scrollbar class="add-network__scroll-area" :settings="settings">
        <add-network-search :input="search" />

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
  </div>
</template>

<script lang="ts">
export default {
  name: "AddNetwork",
};
</script>

<script setup lang="ts">
import AddNetworkHeader from "./components/add-network-header.vue";
import AddNetworkSearch from "./components/add-network-search.vue";
import AddNetworkItem from "./components/add-network-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import { getAllNetworks } from "@/libs/utils/networks";
const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};
const popularNames = ["ETH", "MATIC", "DOT", "GLMR"];
const popular = getAllNetworks().filter((net) =>
  popularNames.includes(net.name)
);
const all = getAllNetworks();

defineProps({
  close: {
    type: Function,
    default: () => ({}),
  },
});

const search = (value: string) => {
  console.log(value);
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.add-network {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__wrap {
    background: @white;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    box-sizing: border-box;
    width: 460px;
    height: auto;
    z-index: 107;
    position: relative;
    max-height: 568px;
    overflow-x: hidden;
  }

  &__container {
    width: 800px;
    height: 600px;
    left: 0px;
    top: 0px;
    position: fixed;
    z-index: 105;
    display: flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  &__overlay {
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }

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
    max-height: 500px;
    margin: 0;
    padding: 0 32px !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }
}
</style>
