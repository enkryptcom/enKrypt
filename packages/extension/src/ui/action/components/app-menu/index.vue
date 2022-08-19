<template>
  <div class="app-menu">
    <custom-scrollbar v-if="!!networks" class="app-menu__scroll-area">
      <draggable v-model="searchNetworks" item-key="name" @change="onChange">
        <template #item="{ element }">
          <app-menu-item
            :network="element"
            :is-active="!!selected && element.name === selected"
            :selected="selected"
            @click="emit('update:network', element)"
          />
        </template>
      </draggable>
    </custom-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import AppMenuItem from "./components/app-menu-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import draggable from "vuedraggable";
import NetworksState from "@/libs/networks-state";
import { BaseNetwork } from "@/types/base-network";
import { computed } from "@vue/reactivity";

const props = defineProps({
  networks: {
    type: Array as PropType<BaseNetwork[]>,
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
  searchInput: {
    type: String,
    default: "",
  },
});
const emit = defineEmits<{
  (e: "update:network", network: BaseNetwork): void;
  (e: "update:order", networks: BaseNetwork[]): void;
}>();

const searchNetworks = computed({
  get: () => {
    return props.networks.filter(
      (net) =>
        net.name_long
          .toLowerCase()
          .startsWith(props.searchInput.toLowerCase()) ||
        net.currencyName
          .toLowerCase()
          .startsWith(props.searchInput.toLowerCase())
    );
  },
  set: (value) => {
    emit("update:order", value);
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
  margin-top: 16px;
  overflow-y: auto;
  margin-bottom: 56px;

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 432px;

    &.ps--active-y {
      padding-right: 0 !important;
    }

    .ps__rail-y {
      right: 4px !important;
    }
  }
}
</style>
