<template>
  <div
    ref="appMenuRef"
    :class="[isExpanded ? 'expand-menu' : 'collapse-menu', 'app__menu']"
  >
    <!-- Networks Search  -->
    <div class="app__menu-row" :class="{ border: orderedNetworks.length > 9 }">
      <div class="app__menu-row">
        <logo-min v-if="isExpanded" class="app__menu-logo" />
        <button
          v-else
          @click="setExpanded(true)"
          aria-label="Expand Networks Menu"
        >
          <expand-menu :is-expanded="false" />
        </button>
        <updated-icon
          v-if="isExpanded && updatesIsLoaded && showUpdatesBtn"
          @click="openUpdatesDialog(UpdatesOpenLocation.logo)"
          class="app__menu-updated"
          aria-label="Show Updates"
        />
      </div>

      <div v-if="isExpanded">
        <button
          class="app__menu-link"
          @click="setExpanded(false)"
          aria-label="Collapse Networks Menu"
        >
          <expand-menu :is-expanded="isExpanded" />
        </button>
        <button
          ref="toggle"
          class="app__menu-link"
          @click="toggleMoreMenu"
          aria-label="View Menu"
        >
          <tooltip text="Menu">
            <more-icon />
          </tooltip>
        </button>
        <div v-show="isOpenMore" ref="dropdown" class="app__menu-dropdown">
          <button class="app__menu-dropdown-link" @click="otherNetworksAction">
            <manage-networks-icon /> <span>Other networks</span>
          </button>
          <button
            class="app__menu-dropdown-link"
            @click="emit('action:lock-enkrypt')"
          >
            <hold-icon /> <span>Lock Enkrypt</span>
          </button>
          <button class="app__menu-dropdown-link" @click="settingsAction">
            <settings-icon /> <span>Settings</span>
          </button>
          <div v-if="updatesIsLoaded" class="app__menu-dropdown-divider"></div>
          <button
            v-if="updatesIsLoaded"
            class="app__menu-dropdown-link"
            @click="openUpdatesDialog(UpdatesOpenLocation.settings)"
          >
            <heart-icon class="app__menu-dropdown-link-heart"></heart-icon>
            <span> Updates</span>
          </button>
        </div>
      </div>
    </div>
    <base-search
      ref="searchNetworksComponent"
      v-show="isExpanded"
      :value="searchInput"
      :is-border="false"
      @update:value="updateSearchValue"
    />
    <div v-show="!isExpanded" class="app__menu__search-icon-container">
      <tooltip text="Search Networks" is-top-right teleport-to-app>
        <button
          class="app__menu-link"
          @click="searchOnCollapsed"
          aria-label="Search Networks"
        >
          <search-icon />
        </button>
      </tooltip>
    </div>

    <!-- Networks Tabs  -->
    <app-menu-tab
      v-if="isExpanded"
      :active-category="activeCategory"
      @update:category="setActiveCategory"
    />
    <!-- Scrollable Networks  -->
    <div
      :class="[
        'networks-menu',
        { 'has-bg': isScrolling },
        isExpanded ? 'networks-menu-expand' : 'networks-menu-collapse',
      ]"
    >
      <div
        :class="[
          'networks-menu__scroll-area',
          isExpanded
            ? 'networks-menu__scroll-area-expand'
            : 'networks-menu__scroll-area-collapse',
        ]"
        ref="scrollDiv"
      >
        <app-menu-sort
          v-if="isExpanded && activeCategory === NetworksCategory.All"
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
              :is-expanded="isExpanded"
              @click="setNetwork(element)"
              @update:gradient="updateGradient"
              :class="{
                'do-not-drag': !getCanDrag(element),
              }"
            />
          </template>
        </draggable>
        <div
          v-if="showMessage && isExpanded"
          class="networks-menu__scroll-area__message"
        >
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
import MoreIcon from '@action/icons/actions/more.vue';
import HoldIcon from '@action/icons/common/hold-icon.vue';
import LogoMin from '@action/icons/common/logo-min.vue';
import ManageNetworksIcon from '@action/icons/common/manage-networks-icon.vue';
import SettingsIcon from '@action/icons/common/settings-icon.vue';
import UpdatedIcon from '@/ui/action/icons/updates/updated.vue';
import HeartIcon from '@/ui/action/icons/updates/heart.vue';
import draggable from 'vuedraggable';
import { BaseNetwork } from '@/types/base-network';
import { NetworkNames } from '@enkryptcom/types';
import { NetworksCategory } from '@action/types/network-category';
import PinIcon from '@action/icons/actions/pin.vue';
import ExpandMenu from '@action/icons/actions/expand-menu.vue';
import Tooltip from '@/ui/action/components/tooltip/index.vue';
import {
  NetworkSort,
  NetworkSortOption,
  NetworkSortDirection,
} from '@action/types/network-sort';
import { useScroll } from '@vueuse/core';
import { newNetworks, newSwaps } from '@/providers/common/libs/new-features';
import { trackNetwork, trackUpdatesEvents } from '@/libs/metrics';
import {
  NetworkChangeEvents,
  NetworkType,
  UpdatesEventType,
  UpdatesOpenLocation,
} from '@/libs/metrics/types';
import { useNetworksStore } from '@action/store/networks-store';
import { useUpdatesStore } from '@action/store/updates-store';
import { storeToRefs } from 'pinia';
import { onClickOutside } from '@vueuse/core';
import SearchIcon from '@action/icons/common/search.vue';
import { useMenuStore } from '@action/store/menu-store';

const appMenuRef = ref(null);

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
  (e: 'show:updates-dialog'): void;
  (e: 'show:settings-dialog'): void;
  (e: 'action:lock-enkrypt'): void;
  (e: 'show:other-networks-dialog'): void;
}>();

const newNetworksWithTags = ref<{ networks: string[]; swap: string[] }>({
  networks: [],
  swap: [],
});

const setNetwork = async (
  network: BaseNetwork & { isCustomNetwork: boolean },
) => {
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

/** -------------------
 * Expand/Collapse state
 -------------------*/
const menuStore = useMenuStore();
const { isExpanded } = storeToRefs(menuStore);
const setExpanded = (value: boolean) => {
  menuStore.setIsExpanded(value);
};

/** -------------------
 * Updates
 -------------------*/
const updatesStore = useUpdatesStore();
const { updatesIsLoaded, showUpdatesBtn } = storeToRefs(updatesStore);

const openUpdatesDialog = (_location: UpdatesOpenLocation) => {
  showUpdatesBtn.value = false;
  if (isOpenMore.value) {
    closeMoreMenu();
  }
  emit('show:updates-dialog');
  if (props.activeNetwork) {
    trackUpdatesEvents(UpdatesEventType.UpdatesOpen, {
      network: props.activeNetwork.name,
      location: _location,
    });
  }
};

/** ------------------
 *  Search
 -----------------*/
const searchInput = ref('');

const updateSearchValue = (newval: string) => {
  searchInput.value = newval;
};

const searchNetworksComponent = ref<InstanceType<typeof BaseSearch> | null>(
  null,
);

const searchOnCollapsed = () => {
  setExpanded(true);
  searchNetworksComponent.value?.setFocus();
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
    if ((!searchInput.value && searchInput.value === '') || !isExpanded.value) {
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
const { isScrolling, y } = useScroll(scrollDiv);

const getCanDrag = (network: BaseNetwork) => {
  return (
    isExpanded.value &&
    getIsPinned(network.name) &&
    searchInput.value === '' &&
    activeCategory.value !== NetworksCategory.New
  );
};

/** ------------------
 * More Menu
 ------------------*/

const isOpenMore = ref(false);
const timeout = ref<ReturnType<typeof setTimeout> | null>(null);
const dropdown = ref(null);
const toggle = ref(null);

const settingsAction = () => {
  closeMoreMenu();
  emit('show:settings-dialog');
};

const otherNetworksAction = () => {
  closeMoreMenu();
  emit('show:other-networks-dialog');
};

const toggleMoreMenu = () => {
  if (timeout.value != null) {
    clearTimeout(timeout.value);
    timeout.value = null;
  }
  if (isOpenMore.value) {
    closeMoreMenu();
  } else {
    isOpenMore.value = true;
  }
};

const closeMoreMenu = () => {
  if (timeout.value != null) {
    clearTimeout(timeout.value);
  }
  timeout.value = setTimeout(() => {
    isOpenMore.value = false;
  }, 50);
};

onClickOutside(
  dropdown,
  () => {
    closeMoreMenu();
  },
  { ignore: [toggle] },
);
/** ------------------
 * Update Gradient
 ------------------*/
const updateGradient = (newGradient: string) => {
  //hack may be there is a better way. less.modifyVars doesnt work
  if (appMenuRef.value)
    (appMenuRef.value as HTMLElement).style.background =
      `radial-gradient(137.35% 97% at 100% 50%, rgba(250, 250, 250, 0.94) 0%, rgba(250, 250, 250, 0.96) 28.91%, rgba(250, 250, 250, 0.98) 100%), linear-gradient(180deg, ${newGradient} 80%, #684CFF 100%)`;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';
.expand-menu {
  width: 340px;
}
.collapse-menu {
  width: 56px;
}
.app__menu {
  height: 600px;
  position: absolute;
  left: 0;
  top: 0;
  padding: 8px 12px 2px 12px;
  box-sizing: border-box;
  z-index: 1;
  background: @defaultGradient;
  box-shadow: inset -1px 0px 2px 0px rgba(0, 0, 0, 0.16);

  &-logo {
    margin-left: 8px;
  }
  &-updated {
    height: 24px;
    width: 90px;
    cursor: pointer;
    transition: 0.3s;
    filter: brightness(1);
    &:hover {
      filter: brightness(0.9);
    }
  }
  &-row {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
  }
  &__search-icon-container {
    margin-left: -4px;
    padding-top: 4px;
    padding-bottom: 4px;
  }
  &-add {
    display: flex;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    height: 40px;
    padding: 10px 16px 10px 8px;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    text-decoration: none;
    cursor: pointer;
    border-radius: 10px;
    transition: background 300ms ease-in-out;

    &.active,
    &:hover {
      background: @black007;
    }

    svg {
      margin-right: 8px;
    }
  }

  &-link {
    display: inline-block;
    padding: 8px;
    text-decoration: none;
    cursor: pointer;
    font-size: 0;
    border-radius: 10px;
    transition: background 300ms ease-in-out;

    &.active,
    &:hover {
      background: @black007;
    }
  }

  &-dropdown {
    padding: 8px;
    width: 172px;
    background: @white;
    box-shadow:
      0px 0.5px 5px rgba(0, 0, 0, 0.039),
      0px 3.75px 11px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    position: absolute;
    right: 8px;
    top: 48px;
    z-index: 3;

    &-divider {
      height: 1px;
      width: 90%;
      margin: 8px;
      background: @gray02;
    }

    &-link {
      width: 100%;
      height: 48px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      cursor: pointer;
      transition: background 300ms ease-in-out;
      border-radius: 8px;

      &-heart {
        width: 18px !important;
        height: 18px !important;
        margin-right: 16px !important;
        margin-left: 16px !important;
      }

      &:hover,
      &.active {
        background: rgba(0, 0, 0, 0.04);
      }

      svg {
        margin-right: 12px;
        margin-left: 12px;
      }

      span {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
      }
    }
  }
  .networks-menu {
    &-expand {
      padding: 1px 10px 1px 10px;
    }
    &-collapse {
      padding: 1px 6px 1px 4px;
    }
    transition: background-color 0.5s ease-in-out;
    background-color: transparent;
    box-shadow: none;
    margin: 0px -12px 0px -12px;
    transition:
      background-color 0.4s ease-in-out,
      box-shadow 0.4s ease-in-out;
    &__scroll-area {
      &-expand {
        height: 448px;
      }
      &-collapse {
        height: 496px;
      }
      position: static;
      margin: auto;
      width: 100%;

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
        padding-top: 114px;
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
}
button {
  background: none;
  color: inherit;
  padding: inherit;
  font: inherit;
  cursor: pointer;
  border: 0;
}
</style>
