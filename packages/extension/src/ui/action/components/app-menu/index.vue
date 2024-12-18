<template>
  <div>
    <!-- Sort -->

    <!-- Scrollable Networks  -->
    <div :class="['networks-menu', { 'has-bg': isScrolling }]">
      <div v-if="!!networks" class="networks-menu__scroll-area" ref="scrollDiv">
        <app-menu-sort :sortBy="sortBy" @update:sort="updateSort" />

        <draggable
          v-model="searchNetworks"
          item-key="name"
          :animation="500"
          draggable=":not(.do-not-drag)"
        >
          <template #item="{ element }">
            <app-menu-item
              v-bind="$attrs"
              :network="element"
              :is-active="!!selected && element.name === selected"
              :is-pinned="getIsPinned(element.name)"
              :scroll-position="y"
              :can-drag="getCanDrag(element)"
              @click="emit('update:network', element)"
              @update:pin-network="updatePinNetwork"
              @update:gradient="emit('update:gradient', $event)"
              :class="{
                'do-not-drag': !getCanDrag(element),
              }"
            />
          </template>
        </draggable>
        <div v-if="showMessage" class="networks-menu__scroll-area__message">
          <p
            v-if="!searchInput && activeCategory === NetworksCategory.Pinned"
            class="networks-menu__scroll-area__message__pin"
          >
            Press <pin-icon /> Pin button
          </p>
          <p>
            {{ displayMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, computed } from 'vue';
import AppMenuItem from './components/app-menu-item.vue';
import AppMenuSort from './components/app-menu-sort.vue';
import draggable from 'vuedraggable';
import NetworksState from '@/libs/networks-state';
import { BaseNetwork } from '@/types/base-network';
import { NetworkNames } from '@enkryptcom/types';
import { NetworksCategory } from '@action/types/network-category';
import PinIcon from '@action/icons/actions/pin.vue';
import {
  NetworkSort,
  NetworkSortOption,
  NetworkSortDirection,
} from '@action/types/network-sort';
import { useScroll } from '@vueuse/core';

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
  (e: 'update:gradient', data: string): void;
}>();

/** ------------------
 * Pinned
 ------------------*/
const getIsPinned = (network: NetworkNames) => {
  return props.pinnedNetworks.map(pinned => pinned.name).includes(network);
};

/**
 *  Emits an event that network is pinned or unpinned
 * */
const updatePinNetwork = (network: string, isPinned: boolean) => {
  emit('update:pinNetwork', network, isPinned);
};

/** ------------------
 * Sorting
 ------------------*/

const sortBy = ref<NetworkSort>({
  name: NetworkSortOption.Name,
  direction: NetworkSortDirection.Asc,
});

const updateSort = (sort: NetworkSort) => {
  sortBy.value = sort;
};

// const sortNetworks = (networks: BaseNetwork[], sortBy: NetworkSort) => {
//   return networks.sort((a, b) => {
//     if (sortBy.name === NetworkSortName.Name) {
//       return sortBy.direction
//         ? a.name.localeCompare(b.name)
//         : b.name.localeCompare(a.name);
//     }
//     return 0;
//   });
// };

/** ------------------
 * Displayed Networks
 ------------------*/
const searchNetworks = computed({
  get() {
    if (!props.searchInput && props.searchInput === '') {
      return props.networks;
    }
    const beginsWithName: BaseNetwork[] = [];
    const beginsWithSpaceName: BaseNetwork[] = [];
    const includesName: BaseNetwork[] = [];
    const beginsWithCurrency: BaseNetwork[] = [];
    const includesCurrency: BaseNetwork[] = [];
    const search = props.searchInput.toLowerCase();
    for (const network of props.networks) {
      const name_long = network.name_long.toLowerCase();
      const currencyName = network.currencyName.toLowerCase();
      //Check Name
      if (name_long.startsWith(search)) {
        beginsWithName.push(network);
      } else if (name_long.includes(` ${search}`)) {
        beginsWithSpaceName.push(network);
      } else if (name_long.includes(search)) {
        includesName.push(network);
      }
      //Check Currency
      else if (currencyName.startsWith(search)) {
        beginsWithCurrency.push(network);
      } else if (currencyName.includes(search)) {
        includesCurrency.push(network);
      }
    }
    return [
      ...beginsWithName,
      ...beginsWithSpaceName,
      ...includesName,
      ...beginsWithCurrency,
      ...includesCurrency,
    ];
  },
  set(value: BaseNetwork[]) {
    const pinned = value.filter(net => props.pinnedNetworks.includes(net));
    emit('update:order', value);
    if (props.searchInput === '') {
      networksState.reorderNetwork(pinned.map((v: BaseNetwork) => v.name));
    }
  },
});

/** ------------------
 * Message for empty search results & No New Networks
  ------------------*/

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
const scrollDiv = ref<HTMLElement | null>(null);
const { isScrolling, y } = useScroll(scrollDiv, { throttle: 100 });

const getCanDrag = (network: BaseNetwork) => {
  return (
    getIsPinned(network.name) &&
    props.searchInput === '' &&
    props.activeCategory !== NetworksCategory.New
  );
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.networks-menu {
  overflow-y: auto;
  transition: background-color 0.5s ease-in-out;
  background-color: transparent;
  box-shadow: none;
  margin: 0px -12px 0px -12px;
  padding: 1px 10px 1px 10px;
  transition:
    background-color 0.4s ease-in-out,
    box-shadow 0.4s ease-in-out;
  &__scroll-area {
    position: static;
    margin: auto;
    width: 100%;
    height: 452px;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    scroll-behavior: smooth;
    margin-right: -4px;
    padding-right: 3px;
    padding-left: 3px;
    padding-bottom: 3px;
    padding-top: 3px;
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
