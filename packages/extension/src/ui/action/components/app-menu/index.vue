<template>
  <div :class="['app-menu', { 'has-bg': isScrolling }]">
    <div
      v-if="!!networks"
      class="app-menu__scroll-area"
      @scroll="setIsScrolling"
    >
      <!-- NOTE: WHATS seletced props is for, it is not in the component-->
      <draggable v-model="searchNetworks" item-key="name" :animation="300">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, onBeforeUnmount, computed } from 'vue';
import AppMenuItem from './components/app-menu-item.vue';
import draggable from 'vuedraggable';
import NetworksState from '@/libs/networks-state';
import { BaseNetwork } from '@/types/base-network';

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
/** ------------------
 * Scroll
 -------------------*/
const scrollTimeout = ref<number | null>(null);
const isScrolling = ref(false);
const setIsScrolling = () => {
  isScrolling.value = true;
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }
  scrollTimeout.value = window.setTimeout(() => {
    isScrolling.value = false;
  }, 1500);
};

onBeforeUnmount(() => {
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value);
  }
});
</script>

<style lang="less">
@import '@action/styles/theme.less';

.app-menu {
  overflow-y: auto;
  transition: background-color 0.5s ease-in-out;
  background-color: transparent;
  box-shadow: none;
  margin: 0px -12px 0px -12px;
  padding: 4px 10px 0px 10px;
  transition:
    background-color 0.4s ease-in-out,
    box-shadow 0.4s ease-in-out;
  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 452px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: scroll;
    scroll-behavior: smooth;
    margin-right: -4px;
    padding-right: 4px;
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.36);
      border-radius: 20px;
    }
  }
}
.has-bg {
  background-color: rgba(247, 239, 244, 1);
  box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(40px);
}
</style>
