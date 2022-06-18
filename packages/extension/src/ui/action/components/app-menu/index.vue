<template>
  <div class="app-menu">
    <custom-scrollbar v-if="!!networks" class="app-menu__scroll-area">
      <draggable :list="networks" item-key="name" @change="onChange">
        <template #item="{ element }">
          <app-menu-item
            :network="element"
            :is-active="!!selected && element.name === selected"
            :selected="selected"
            @click="setNetwork(element)"
          ></app-menu-item>
        </template>
      </draggable>
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
import draggable from "vuedraggable";
import NetworksState from "@/libs/networks-state";
import { BaseNetwork } from "@/types/base-network";

const props = defineProps({
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

const networksState = new NetworksState();

const onChange = (evt: any) => {
  if (evt.moved) {
    const { element, newIndex }: { element: BaseNetwork; newIndex: number } =
      evt.moved;

    const beforeNetworkName = props.networks[newIndex - 1]
      ? props.networks[newIndex - 1].name
      : undefined;

    networksState.reorderNetwork(element.name, beforeNetworkName);
  }
};
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

    &.ps--active-y {
      padding-right: 0 !important;
    }

    .ps__rail-y {
      right: 4px !important;
    }
  }
}
</style>
