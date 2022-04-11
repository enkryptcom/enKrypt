<template>
  <div class="app-menu">
    <app-menu-item
      v-for="(item, index) in networks"
      :key="index"
      :network="item"
      :is-active="!!selected && item.id === selected"
      :selected="selected"
      @click="setNetwork(item)"
    ></app-menu-item>
  </div>
</template>

<script lang="ts">
export default {
  name: "AppMenu",
};
</script>

<script setup lang="ts">
import { PropType, defineProps } from "vue";
import { NetworkItem } from "@action/types/network";
import AppMenuItem from "./components/app-menu-item.vue";
defineProps({
  networks: {
    type: Array as PropType<Array<NetworkItem>>,
    default: () => [],
  },
  selected: {
    type: Number,
    default: () => {
      return {};
    },
  },
  setNetwork: {
    type: Function,
    default: () => ({}),
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.app-menu {
  margin: 16px 0;
}
</style>
