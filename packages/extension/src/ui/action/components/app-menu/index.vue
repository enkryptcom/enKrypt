<template>
  <div class="app-menu">
    <custom-scrollbar class="app-menu__scroll-area">
      <app-menu-item
        v-for="(item, index) in networks"
        :key="index"
        :network="item"
        :is-active="!!selected && item.name === selected"
        :selected="selected"
        @click="setNetwork(item)"
      ></app-menu-item>
    </custom-scrollbar>
  </div>
</template>

<script lang="ts">
export default {
  name: "AppMenu",
};
</script>

<script setup lang="ts">
import { NodeType } from "@/types/provider";
import { PropType } from "vue";
import AppMenuItem from "./components/app-menu-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
defineProps({
  networks: {
    type: Array as PropType<Array<NodeType>>,
    default: () => [],
  },
  selected: {
    type: String,
    default: "",
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
  overflow-y: auto;

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 400px;
  }
}
</style>
