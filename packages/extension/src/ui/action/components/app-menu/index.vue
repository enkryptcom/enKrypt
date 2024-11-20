<template>
  <div :class="['app-menu', { 'has-bg': isScrolling }]">
    <custom-scrollbar
      v-if="!!networks"
      :class="'app-menu__scroll-area'"
      @changeIsScrolling="setIsScrolling"
    >
      <draggable v-model="searchNetworks" item-key="name" :animation="300">
        <!-- NOTE: WHATS seletced props is for, it is not in the component-->
        <template #item="{ element }">
          <app-menu-item
            v-bind="$attrs"
            :network="element"
            :is-active="!!selected && element.name === selected"
            :selected="selected"
            :pinnedNetworks="pinnedNetworks"
            @click="emit('update:network', element)"
          />
        </template>
      </draggable>
    </custom-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue';
import AppMenuItem from './components/app-menu-item.vue';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import draggable from 'vuedraggable';
import NetworksState from '@/libs/networks-state';
import { BaseNetwork } from '@/types/base-network';
import { computed } from 'vue';
const networksState = new NetworksState();
const props = defineProps({
  networks: {
    type: Array as PropType<BaseNetwork[]>,
    default: () => [],
  },
  selected: {
    type: String,
    default: '',
  },
  setNetwork: {
    type: Function,
    default: () => ({}),
  },
  searchInput: {
    type: String,
    default: '',
  },
  pinnedNetworks: {
    type: Array as PropType<BaseNetwork[]>,
    default: () => [],
  },
});
const emit = defineEmits<{
  (e: 'update:network', network: BaseNetwork): void;
  (e: 'update:order', networks: BaseNetwork[]): void;
}>();

const searchNetworks = computed({
  get: () => {
    return props.networks.filter(
      net =>
        net.name_long
          .toLowerCase()
          .startsWith(props.searchInput.toLowerCase()) ||
        net.currencyName
          .toLowerCase()
          .startsWith(props.searchInput.toLowerCase()),
    );
  },
  set: value => {
    emit('update:order', value);
    if (props.searchInput === '') {
      networksState.reorderNetwork(value.map(v => v.name));
    }
  },
});

const isScrolling = ref(false);
const setIsScrolling = (val: boolean) => {
  isScrolling.value = val;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.app-menu {
  margin-top: 8px;
  overflow-y: auto;
  transition: background-color 0.5s ease-in-out;
  background-color: transparent;
  margin: 0px -12px 0px -12px;
  padding: 10px 10px 0px 10px;

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 452px;

    &.ps--active-y {
      padding-right: 0 !important;
    }
    .ps__rail-y {
      right: 4px !important;
    }
  }
}
.has-bg {
  background: rgba(247, 239, 244, 1);
}
</style>
