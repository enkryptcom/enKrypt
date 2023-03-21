<template>
  <div>
    <div
      class="add-network__header"
      :class="{ border: isHasScroll() && scrollProgress > 0 }"
    >
      <h3>Manage networks</h3>

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
        @toggle:test-networks="onTestNetCheck"
        @action:custom-network="toCustom"
      />

      <div v-if="searchInput === ''">
        <h3 class="add-network__list-header">Popular</h3>
        <add-network-item
          v-for="(item, index) in popular"
          :key="index"
          :network="item"
          :is-active="item.isActive"
          @network-toggled="onToggle"
        />
      </div>
      <h3 class="add-network__list-header">All networks</h3>
      <add-network-item
        v-for="item in searchAllNetworks"
        :key="item.name"
        :network="item"
        :is-active="item.isActive"
        :is-custom-network="(item as unknown as CustomEvmNetwork).isCustomNetwork"
        @network-toggled="onToggle"
        @network-deleted="onNetworkDeleted"
      />
    </custom-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, ComponentPublicInstance, PropType } from "vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
import AddNetworkSearch from "../components/add-network-search.vue";
import AddNetworkItem from "../components/add-network-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import { NodeType } from "@/types/provider";
import { getAllNetworks, POPULAR_NAMES } from "@/libs/utils/networks";
import NetworksState from "@/libs/networks-state";
import scrollSettings from "@/libs/utils/scroll-settings";
import { computed } from "@vue/reactivity";
import { CustomEvmNetwork } from "@/providers/ethereum/types/custom-evm-network";
import CustomNetworksState from "@/libs/custom-networks-state";

interface NodeTypesWithActive extends NodeType {
  isActive: boolean;
}
const emit = defineEmits<{
  (e: "update:activeNetworks"): void;
}>();

const networksState = new NetworksState();
const searchInput = ref("");
const all = ref<Array<NodeTypesWithActive>>([]);
const popular = ref<Array<NodeTypesWithActive>>([]);
const scrollProgress = ref(0);
const manageNetworkScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
const showTestNets = ref(false);

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
  const activeNetworks = await networksState.getActiveNetworkNames();

  const allNetworks = (await getAllNetworks()).map((net) => {
    return {
      ...net,
      isActive: activeNetworks.includes(net.name),
    };
  });

  return allNetworks;
};

const searchAllNetworks = computed(() => {
  return all.value.filter((a) =>
    a.name_long.toLowerCase().startsWith(searchInput.value.toLowerCase())
  );
});
onBeforeMount(async () => {
  const allNetworksNotTestNets = (await getAllNetworksAndStatus())
    .filter(({ isTestNetwork }) => !isTestNetwork)
    .sort((a, b) => a.name_long.localeCompare(b.name_long));

  const popularNetworks = allNetworksNotTestNets
    .filter((net) => POPULAR_NAMES.includes(net.name))
    .sort((a, b) => a.name_long.localeCompare(b.name_long));

  all.value = allNetworksNotTestNets;
  popular.value = popularNetworks;
});

const onTestNetCheck = async () => {
  showTestNets.value = !showTestNets.value;

  if (showTestNets.value) {
    all.value = await getAllNetworksAndStatus();
  } else {
    all.value = all.value.filter(({ isTestNetwork }) => !isTestNetwork);
  }
};

const onToggle = async (networkName: string, isActive: boolean) => {
  try {
    await networksState.setNetworkStatus(networkName, isActive);
    emit("update:activeNetworks");
    all.value = all.value.map((network) => {
      if (network.name === networkName) {
        network.isActive = isActive;
      }

      return network;
    });

    popular.value = all.value.filter(({ name }) =>
      POPULAR_NAMES.includes(name)
    );
  } catch (e) {
    console.error(e);
  }
};

const onNetworkDeleted = async (chainId: string) => {
  const customNetworksState = new CustomNetworksState();
  await customNetworksState.deleteEVMNetwork(chainId);

  all.value = await getAllNetworksAndStatus();
  emit("update:activeNetworks");
};

const updateSearch = (value: string) => {
  searchInput.value = value;
};
const handleScroll = (e: any) => {
  const progress = Number(e.target.lastChild.style.top.replace("px", ""));
  scrollProgress.value = progress;
};
const isHasScroll = () => {
  if (manageNetworkScrollRef.value) {
    return manageNetworkScrollRef.value.$el.classList.contains("ps--active-y");
  }

  return false;
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

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
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05),
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
    margin: 0;
    padding: 0 32px !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }
}
</style>
