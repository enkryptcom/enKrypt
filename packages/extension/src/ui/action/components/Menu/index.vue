<template>
  <div class="app-menu">
    <Item
      v-for="(item, index) in networks"
      :key="index"
      :network="item"
      :is-active="!!selected && item.id === selected.id"
      :selected="selected"
      @click="setNetwork(item)"
    />
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { NetworkItem } from "@action/types/network";
import Item from "./components/Item.vue";
defineProps({
  networks: {
    type: Array as PropType<Array<NetworkItem>>,
    default: () => [],
  },
  selected: {
    type: Object as PropType<NetworkItem>,
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
