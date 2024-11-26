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
            :network="item"
            :is-active="item.isActive"
            :is-custom-network="true"
            @network-toggled="onToggle"
            @network-deleted="onNetworkDeleted"
          />
        </div>
        <div v-else class="add-network__no-custom-networks">
          You can add your own custom networks. <br />
          Just press the + button above.
        </div>
        <h3 class="add-network__list-header">Test networks</h3>
        <add-network-item
          v-for="item in searchAllNetworks"
          :key="item.name"
          :network="item"
          :is-active="item.isActive"
          :is-custom-network="
            (item as unknown as CustomEvmNetwork).isCustomNetwork
          "
          @network-toggled="onToggle"
          @network-deleted="onNetworkDeleted"
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
import {
  CustomEvmNetwork,
  CustomEvmNetworkOptions,
} from '@/providers/ethereum/types/custom-evm-network';
import { BaseNetwork } from '@/types/base-network';

interface NodeTypesWithActive extends NodeType {
  isActive: boolean;
}
const emit = defineEmits<{
  (e: 'update:activeNetworks'): void;
}>();

const networksState = new NetworksState();
const customNetworksState = new CustomNetworksState();
const searchInput = ref('');
const allTestNets = ref<Array<NodeTypesWithActive>>([]);
const scrollProgress = ref(0);
const manageNetworkScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
const showTestNets = ref(false);
const hasMoreThanOneActiveNetwork = ref(false);
const allCustomNetworks = ref<CustomEvmNetwork[]>([]);

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

const getAllNetworksAndStatus = async () => {
  const activeNetworks = await networksState.getPinnedNetworkNames();

  const allNetworks = (await getAllNetworks(false)).map(net => {
    return {
      ...net,
      isActive: activeNetworks.includes(net.name),
    };
  });

  return allNetworks;
};

const searchAllNetworks = computed(() => {
  return allTestNets.value.filter(a =>
    a.name_long.toLowerCase().startsWith(searchInput.value.toLowerCase()),
  );
});

const hasCustomNetworks = computed(() => {
  return allCustomNetworks.value.length > 0;
});

const setNetworkLists = async () => {
  const activeNetworks = await networksState.getPinnedNetworkNames();
  const customs = await customNetworksState.getAllCustomEVMNetworks();
  const customNetworks = customs.map(options => {
    const newCustomNetwork = new CustomEvmNetwork(options);
    return {
      ...newCustomNetwork,
      isActive: activeNetworks.includes(newCustomNetwork.name),
    };
  });
  const networks = await getAllNetworksAndStatus();
  const allNetworksTestNets = networks
    .filter(({ isTestNetwork }) => isTestNetwork)
    .sort((a, b) => a.name_long.localeCompare(b.name_long));

  allTestNets.value = allNetworksTestNets;
  allCustomNetworks.value = customNetworks;
};

onBeforeMount(async () => {
  await setNetworkLists();
});

const onToggle = async (networkName: string, isActive: boolean) => {
  try {
    await networksState.setNetworkStatus(networkName, isActive);
    emit('update:activeNetworks');
    allTestNets.value = allTestNets.value.map(network => {
      if (network.name === networkName) {
        network.isActive = isActive;
      }

      return network;
    });
  } catch (e) {
    console.error(e);
  }
};

const onNetworkDeleted = async (chainId: string) => {
  await customNetworksState.deleteEVMNetwork(chainId);

  // allTestNets.value = await getAllNetworksAndStatus();
  // hasMoreThanOneActiveNetwork.value =
  //   allTestNets.value.filter(net => net.isActive).length > 1;
  await setNetworkLists();
  emit('update:activeNetworks');
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
    border-radius: 8px;
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
    text-align: center;
    color: rgba(0, 0, 0, 0.38);
  }
}
</style>
