<template>
  <div>
    <!-- Networks Search  -->
    <base-search
      :value="searchInput"
      :is-border="false"
      @update:value="updateSearchValue"
    />
    <!-- Networks Tabs  -->
    <app-menu-tab
      :active-category="activeCategory"
      @update:category="setActiveCategory"
    />
    <!-- Scrollable Networks  -->
    <div :class="['networks-menu', { 'has-bg': isScrolling }]">
      <div class="networks-menu__scroll-area" ref="scrollDiv">
        <app-menu-sort
          v-if="activeCategory === NetworksCategory.All"
          :sortBy="sortBy"
          @update:sort="updateSort"
        />
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
              :is-active="
                !!activeNetwork && element.name === activeNetwork.name
              "
              :is-pinned="getIsPinned(element.name)"
              :scroll-position="y"
              :can-drag="getCanDrag(element)"
              :new-network-tags="newNetworksWithTags"
              @click="setNetwork(element)"
              @update:gradient="emit('update:gradient', $event)"
              :class="{
                'do-not-drag': !getCanDrag(element),
              }"
            />
          </template>
        </draggable>
        <div v-if="showMessage" class="networks-menu__scroll-area__message">
          <p
            v-if="
              searchInput === '' && activeCategory === NetworksCategory.Pinned
            "
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
import { PropType, ref, computed, onMounted } from 'vue';
import AppMenuTab from './components/app-menu-tab.vue';
import AppMenuItem from './components/app-menu-item.vue';
import AppMenuSort from './components/app-menu-sort.vue';
import BaseSearch from '@action/components/base-search/index.vue';
import draggable from 'vuedraggable';
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
import { newNetworks, newSwaps } from '@/providers/common/libs/new-features';
import { trackNetwork } from '@/libs/metrics';
import { NetworkChangeEvents, NetworkType } from '@/libs/metrics/types';
import { useNetworksStore } from '../../store/networks-store';
import { storeToRefs } from 'pinia';

const props = defineProps({
  activeNetwork: {
    type: Object as PropType<BaseNetwork>,
  },
});

const networksStore = useNetworksStore();
const { orderedNetworks, pinnedNetworks, pinnedNetworkNames } =
  storeToRefs(networksStore);

const emit = defineEmits<{
  (e: 'update:network', network: BaseNetwork): void;
  (e: 'update:gradient', data: string): void;
}>();

const newNetworksWithTags = ref<{ networks: string[]; swap: string[] }>({
  networks: [],
  swap: [],
});

const setNetwork = async (network: BaseNetwork) => {
  if (newNetworks.includes(network.name)) {
    await networksStore.networksState.setUsedFeature('networks', network.name);
    newNetworksWithTags.value.networks =
      newNetworksWithTags.value.networks.filter(net => net !== network.name);
  }
  if (newSwaps.includes(network.name)) {
    await networksStore.networksState.setUsedFeature('swap', network.name);
    newNetworksWithTags.value.swap = newNetworksWithTags.value.swap.filter(
      net => net !== network.name,
    );
  }

  const networkType = network.isTestNetwork
    ? NetworkType.Testnet
    : network.isCustomNetwork
      ? NetworkType.Custom
      : NetworkType.Regular;
  trackNetwork(NetworkChangeEvents.NetworkActiveChanged, {
    network: network.name,
    networkType,
  });
  emit('update:network', network);
};

onMounted(async () => {
  const usedNetworks = await networksStore.networksState.getUsedFeatures();
  newNetworksWithTags.value.networks = newNetworks.filter(
    net => !usedNetworks.networks.includes(net),
  );
  newNetworksWithTags.value.swap = newSwaps.filter(
    net => !usedNetworks.swap.includes(net),
  );
});

/** ------------------
 *  Search
 -----------------*/
const searchInput = ref('');

const updateSearchValue = (newval: string) => {
  searchInput.value = newval;
};

/** ------------------
 * Pinned
 ------------------*/
const getIsPinned = (network: NetworkNames) => {
  return pinnedNetworkNames.value.includes(network);
};

/** ------------------
 * Active Category
 ------------------*/
const activeCategory = ref<NetworksCategory>(NetworksCategory.All);

const setActiveCategory = async (category: NetworksCategory) => {
  activeCategory.value = category;
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

const sortNetworks = (networks: BaseNetwork[], sortBy: NetworkSort) => {
  return networks.sort((a, b) => {
    if (sortBy.name === NetworkSortOption.Name) {
      return sortBy.direction === NetworkSortDirection.Asc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });
};

/** ------------------
 * Displayed Networks
 ------------------*/
const searchNetworks = computed({
  get() {
    if (!props.activeNetwork) return [];
    if (!searchInput.value && searchInput.value === '') {
      //All Networks
      if (activeCategory.value === NetworksCategory.All) {
        const other = orderedNetworks.value.filter(
          net => !pinnedNetworkNames.value.includes(net.name),
        );
        return [...pinnedNetworks.value, ...sortNetworks(other, sortBy.value)];
      }
      //Pinned Networks
      else if (activeCategory.value === NetworksCategory.Pinned) {
        const hasCurrentNetwork = pinnedNetworkNames.value.includes(
          props.activeNetwork.name,
        );
        return hasCurrentNetwork
          ? pinnedNetworks.value
          : [...pinnedNetworks.value, props.activeNetwork];
      }
      //New Networks
      else {
        const networks = orderedNetworks.value.filter(net =>
          newNetworks.includes(net.name),
        );
        const hasCurrentNetwork = networks
          .map(network => network.name)
          .includes(props.activeNetwork.name);
        return hasCurrentNetwork
          ? networks
          : [...networks, props.activeNetwork];
      }
    }
    //Search Networks
    const beginsWithName: BaseNetwork[] = [];
    const beginsWithSpaceName: BaseNetwork[] = [];
    const includesName: BaseNetwork[] = [];
    const beginsWithCurrency: BaseNetwork[] = [];
    const includesCurrency: BaseNetwork[] = [];
    const search = searchInput.value.toLowerCase();
    for (const network of orderedNetworks.value) {
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
    if (
      searchInput.value === '' &&
      activeCategory.value !== NetworksCategory.New
    ) {
      const pinned = value.filter(net => pinnedNetworks.value.includes(net));
      networksStore.updateNetworkOrder(pinned.map((v: BaseNetwork) => v.name));
    }
  },
});

/** ------------------
 * Message for empty search results & No New Networks
  ------------------*/

const showMessage = computed(() => {
  if (searchInput.value !== '') {
    return searchNetworks.value.length < 1;
  } else if (activeCategory.value === NetworksCategory.Pinned) {
    return pinnedNetworkNames.value.length < 1;
  } else if (activeCategory.value === NetworksCategory.New) {
    return newNetworksWithTags.value.networks.length < 1;
  }
  return searchNetworks.value.length < 1;
});

const displayMessage = computed(() => {
  if (searchInput.value !== '') {
    return `Network not found: '${searchInput.value}'.`;
  } else if (activeCategory.value === NetworksCategory.New) {
    return 'There are no new networks.';
  } else if (activeCategory.value === NetworksCategory.Pinned) {
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
    searchInput.value === '' &&
    activeCategory.value !== NetworksCategory.New
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
