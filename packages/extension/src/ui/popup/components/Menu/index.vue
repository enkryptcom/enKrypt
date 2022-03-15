<template>
  <div class="app-menu">
    <Item
      v-for="(item, index) in networks"
      :key="index"
      :network="item"
      :is-active="!!selected && item.id === selected.id"
      :selected="selected"
      @click="setNetwork(item)"
    ></Item>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { NetworkItem } from "../../types/network";
import Item from "./components/Item.vue";

export default defineComponent({
  name: "AppMenu",
  components: {
    Item,
  },
  props: {
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
  },
});
</script>

<style lang="less">
@import "../../theme/theme.less";

.app-menu {
  margin: 16px 0;
}
</style>
