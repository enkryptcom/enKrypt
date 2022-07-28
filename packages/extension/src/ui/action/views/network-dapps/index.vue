<template>
  <div class="container">
    <custom-scrollbar
      class="network-dapps__scroll-area"
      :settings="scrollSettings({ suppressScrollX: true })"
    >
      <div v-if="!!selected" class="network-dapps">
        <network-dapps-item
          v-for="(item, index) in list"
          :key="index"
          :app="item"
        ></network-dapps-item>
      </div>
    </custom-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import NetworkDappsItem from "./components/network-dapps-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import scrollSettings from "@/libs/utils/scroll-settings";
import { computed, PropType } from "vue";
import { BaseNetwork } from "@/types/base-network";
import DappList from "@/libs/dapp-list";
import { NetworkNames } from "@enkryptcom/types";

const route = useRoute();

const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
});

const selected: string = route.params.id as string;

const list = computed(() => {
  if (DappList[props.network.name]) return DappList[props.network.name];
  return DappList[NetworkNames.Ethereum];
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.container {
  width: 100%;
  height: 600px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  padding-top: 0;
  box-sizing: border-box;
}

.network-dapps {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 20px;

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 600px;
    margin: 0;
    padding: 68px 0 0 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }
}
</style>

<style lang="less">
.network-dapps__scroll-area {
  .ps__rail-y {
    right: 3px !important;
    margin: 59px 0 !important;
  }
}
</style>
