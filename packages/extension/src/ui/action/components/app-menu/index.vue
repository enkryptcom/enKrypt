<template>
  <div :class="['app-menu', { 'has-bg': isScrolling }]">
    <div
      v-if="!!networks"
      class="app-menu__scroll-area"
      @scroll="setIsScrolling"
    >
      <!-- NOTE: WHATS seletced props is for, it is not in the component-->
      <draggable v-model="draggableNetworks" item-key="name" :animation="500">
        <template #item="{ element }">
          <app-menu-item
            v-bind="$attrs"
            :network="element"
            :is-active="!!selected && element.name === selected"
            :selected="selected"
            :is-pinned="getIsPinned(element.name)"
            @click="emit('update:network', element)"
            @update:pin-network="updatePinNetwork"
          />
        </template>
      </draggable>
      <div>
        <app-menu-item
          v-for="element in otherNetworks"
          :key="element.name"
          v-bind="$attrs"
          :network="element"
          :is-active="!!selected && element.name === selected"
          :selected="selected"
          :is-pinned="getIsPinned(element.name)"
          @click="emit('update:network', element)"
          @update:pin-network="updatePinNetwork"
        />
      </div>
      <div v-if="showMessage" class="app-menu__scroll-area__message">
        <p
          v-if="!searchInput && activeCategory === NetworksCategory.Pinned"
          class="app-menu__scroll-area__message__pin"
        >
          Press <pin-icon /> Pin button
        </p>
        <p>
          {{ displayMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, onBeforeUnmount, computed } from 'vue';
import AppMenuItem from './components/app-menu-item.vue';
import draggable from 'vuedraggable';
import NetworksState from '@/libs/networks-state';
import { BaseNetwork } from '@/types/base-network';
import { NetworkNames } from '@enkryptcom/types';
import { NetworksCategory } from '@action/types/network-category';
import PinIcon from '@action/icons/actions/pin.vue';

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
  activeCategory: {
    type: String as PropType<NetworksCategory>,
    required: true,
  },
});
const emit = defineEmits<{
  (e: 'update:network', network: BaseNetwork): void;
  (e: 'update:order', networks: BaseNetwork[]): void;
  (e: 'update:pinNetwork', network: string, isPinned: boolean): void;
}>();

const getIsPinned = (network: NetworkNames) => {
  return props.pinnedNetworks.map(pinned => pinned.name).includes(network);
};
const searchNetworks = computed(() => {
  return props.networks.filter(
    net =>
      net.name_long.toLowerCase().startsWith(props.searchInput.toLowerCase()) ||
      net.currencyName
        .toLowerCase()
        .startsWith(props.searchInput.toLowerCase()),
  );
});

const draggableNetworks = computed({
  get() {
    return searchNetworks.value.filter(net =>
      props.pinnedNetworks.includes(net),
    );
  },
  set(value: BaseNetwork[]) {
    emit('update:order', value);
    if (props.searchInput === '') {
      networksState.reorderNetwork(value.map((v: BaseNetwork) => v.name));
    }
  },
});

const otherNetworks = computed(() => {
  return searchNetworks.value.filter(network => !getIsPinned(network.name));
});

const updatePinNetwork = (network: string, isPinned: boolean) => {
  emit('update:pinNetwork', network, isPinned);
};

/**
 * Message for empty search results & No New Networks
 */

const showMessage = computed(() => {
  return searchNetworks.value.length < 1;
});

const displayMessage = computed(() => {
  if (props.searchInput) {
    return `Network not found: '${props.searchInput}'.`;
  } else if (props.activeCategory === NetworksCategory.New) {
    return 'There are no new networks.';
  } else if (props.activeCategory === NetworksCategory.Pinned) {
    return 'to add your favorite network here.';
  }
  return 'Networks not available.';
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
    height: 452px;
    display: flex;
    flex-direction: column;
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
    &__message {
      padding-top: 104px;
      height: 100%;
      max-width: 222px;
      margin-left: auto;
      margin-right: auto;
      p {
        color: @tertiaryLabel;
        font-size: 14px;
        line-height: 20px;
        font-weight: 400;
        letter-spacing: 0.25px;
        text-align: end;
        margin-top: 0px;
        margin-bottom: 0px;
      }
      &__pin {
        display: flex;
        justify-content: center;
        align-items: center;

        svg {
          max-width: 32px;
          max-height: 24px;
          padding: 4px 8px 4px 8px;
          background: transparent;
          border-radius: 24px;
          background: @primaryLight;
          margin-right: 4px;
          margin-left: 4px;
        }
      }
    }
  }
}
.has-bg {
  background-color: rgba(247, 239, 244, 1);
  box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(40px);
}
</style>
