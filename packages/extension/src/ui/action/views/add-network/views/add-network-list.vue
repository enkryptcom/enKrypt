<template>
  <div>
    <div
      class="add-network__header"
      :class="{ border: isHasScroll() && scrollProgress > 0 }"
    >
      <h3>Testnets & custom networks</h3>

      <a class="add-network__close" @click="close">
        <close-icon />
      </a>
    </div>

    <custom-scrollbar
      ref="manageNetworkScrollRef"
      class="add-network__scroll-area"
      :settings="scrollSettings({ suppressScrollX: true })"
      @ps-scroll-y="handleScroll"
    >
      <add-network-search
        :value="searchInput"
        @update:value="updateSearch"
        @action:custom-network="toCustom"
      />
      <div v-if="searchInput === ''">
        <h3 class="add-network__list-header">My custom networks</h3>
        <div v-if="hasCustomNetworks">
          <add-network-item
            v-for="(item, index) in allCustomNetworks"
            :key="index"
            :network="item as CustomEvmNetwork"
            :is-pinned="getIsPinned(item.name)"
            :is-active="true"
            :is-custom-network="true"
            @network-deleted="onNetworkDeleted"
            @update:pin-network="onTogglePin"
          />
        </div>
        <div v-else class="add-network__no-custom-networks">
          You can add your own custom networks.
          <span> Just press the <plus-small-icon /> button above. </span>
        </div>
        <h3 class="add-network__list-header">Test networks</h3>
        <add-network-item
          v-for="item in displayTestNetworks"
          :key="item.name"
          :network="item"
          :is-pinned="getIsPinned(item.name)"
          :is-active="getIsEnabled(item.name)"
          :is-custom-network="false"
          @test-network-toggled="onTestnetToggle"
          @network-deleted="onNetworkDeleted"
          @update:pin-network="onTogglePin"
        />
      </div>
    </custom-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, ComponentPublicInstance, PropType } from 'vue';
import CloseIcon from '@action/icons/common/close-icon.vue';
import AddNetworkSearch from '../components/add-network-search.vue';
import AddNetworkItem from '../components/add-network-item.vue';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import { NodeType } from '@/types/provider';
import { getAllNetworks } from '@/libs/utils/networks';
import NetworksState from '@/libs/networks-state';
import CustomNetworksState from '@/libs/custom-networks-state';
import scrollSettings from '@/libs/utils/scroll-settings';
import { computed } from 'vue';
import { CustomEvmNetwork } from '@/providers/ethereum/types/custom-evm-network';
import PlusSmallIcon from '@/ui/action/icons/common/plus-small-icon.vue';
import { NetworkNames } from '@enkryptcom/types';

const emit = defineEmits<{
  (e: 'update:pinNetwork', network: string, isPinned: boolean): void;
  (e: 'update:testNetworkToggle'): void;
}>();

const networksState = new NetworksState();
const customNetworksState = new CustomNetworksState();
const searchInput = ref('');
const allTestNets = ref<NodeType[]>([]);
const scrollProgress = ref(0);
const manageNetworkScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
const allCustomNetworks = ref<CustomEvmNetwork[]>([]);
const pinnedNetworks = ref<string[]>([]);
const enabledTestNetworks = ref<string[]>([]);

defineExpose({ manageNetworkScrollRef });

defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  toCustom: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});

const displayTestNetworks = computed<NodeType[]>(() => {
  return allTestNets.value.filter(a =>
    a.name_long.toLowerCase().startsWith(searchInput.value.toLowerCase()),
  );
});

const hasCustomNetworks = computed(() => {
  return allCustomNetworks.value.length > 0;
});

const setNetworkLists = async () => {
  //Get Pinned Networks
  pinnedNetworks.value = await networksState.getPinnedNetworkNames();
  //Get Custom Networks
  const customs = await customNetworksState.getAllCustomEVMNetworks();
  const customNetworks = customs.map(options => {
    return new CustomEvmNetwork(options);
  });
  allCustomNetworks.value = customNetworks;
  //Get Test Networks
  const testNetworks = await getAllNetworks();
  const allNetworksTestNets = testNetworks
    .filter(({ isTestNetwork }) => isTestNetwork)
    .sort((a, b) => a.name_long.localeCompare(b.name_long));
  enabledTestNetworks.value = await networksState.getEnabledTestNetworks();
  allTestNets.value = allNetworksTestNets;
};

onBeforeMount(async () => {
  await setNetworkLists();
});

/** -------------------
 * Pin Actions
 * ------------------- */

const getIsPinned = (network: NetworkNames) => {
  return pinnedNetworks.value.includes(network);
};

const getIsEnabled = (network: NetworkNames) => {
  return enabledTestNetworks.value.includes(network);
};

const onTogglePin = async (networkName: string, isActive: boolean) => {
  try {
    await networksState.setNetworkStatus(networkName, isActive);
    if (isActive && allTestNets.value.find(net => net.name === networkName)) {
      await networksState.setTestnetStatus(networkName, isActive);
    }
    emit('update:pinNetwork', networkName, isActive);
    await setNetworkLists();
  } catch (e) {
    console.error(e);
  }
};

const onTestnetToggle = async (
  networkName: NetworkNames,
  isActive: boolean,
) => {
  await networksState.setTestnetStatus(networkName, isActive);
  await setNetworkLists();
  if (!isActive && getIsPinned(networkName)) {
    onTogglePin(networkName, false);
  }
  emit('update:testNetworkToggle');
};

const onNetworkDeleted = async (chainId: string) => {
  await customNetworksState.deleteEVMNetwork(chainId);
  await setNetworkLists();
  emit('update:pinNetwork', chainId, false);
};

const updateSearch = (value: string) => {
  searchInput.value = value;
};
const handleScroll = (e: any) => {
  const progress = Number(e.target.lastChild.style.top.replace('px', ''));
  scrollProgress.value = progress;
};
const isHasScroll = () => {
  if (manageNetworkScrollRef.value) {
    return manageNetworkScrollRef.value.$el.classList.contains('ps--active-y');
  }

  return false;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

.add-network {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__header {
    width: 100%;
    background: @white;
    box-sizing: border-box;
    padding: 24px 72px 12px 32px;
    position: relative;
    z-index: 4;

    h3 {
      font-style: normal;
      font-weight: bold;
      font-size: 24px;
      line-height: 32px;
      margin: 0;
      color: @primaryLabel;
    }

    &.border {
      box-shadow:
        0px 0px 6px rgba(0, 0, 0, 0.05),
        0px 0px 1px rgba(0, 0, 0, 0.25);
      padding: 14px 72px 12px 32px;

      h3 {
        font-size: 20px;
        line-height: 28px;
      }
    }
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__list {
    &-header {
      font-style: normal;
      font-weight: bold;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      margin: 8px 0 0 0;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 500px;
    min-height: 250px;
    margin: 0;
    padding: 0 32px !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }

  &__no-custom-networks {
    padding: 16px 0;
    line-height: 140%;
    text-align: center;
    color: rgba(0, 0, 0, 0.38);
    span {
      display: flex;
      justify-content: center;
      align-items: center;
      svg {
        margin: 0 4px;
      }
    }
  }
}
</style>
