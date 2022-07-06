<template>
  <div class="add-network__container">
    <div class="add-network__overlay" @click="emit('close:popup')"></div>
    <div class="add-network__wrap">
      <div
        class="add-network__header"
        :class="{ border: isHasScroll() && scrollProgress > 0 }"
      >
        <h3>Manage networks</h3>

        <a class="add-network__close" @click="emit('close:popup')">
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
          :input="search"
          :on-test-net-check="onTestNetCheck"
        />

        <h3 class="add-network__list-header">Popular</h3>

        <add-network-item
          v-for="(item, index) in popular"
          :key="index"
          :network="item"
          :is-active="item.isActive"
          @network-toggled="onToggle"
        ></add-network-item>

        <h3 class="add-network__list-header">All networks</h3>
        <add-network-item
          v-for="item in all"
          :key="item.name"
          :network="item"
          :is-active="item.isActive"
          @network-toggled="onToggle"
        ></add-network-item>
      </custom-scrollbar>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "AddNetwork",
};
</script>

<script setup lang="ts">
import { ref, onBeforeMount, ComponentPublicInstance } from "vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
import AddNetworkSearch from "./components/add-network-search.vue";
import AddNetworkItem from "./components/add-network-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import { NodeType } from "@/types/provider";
import { getAllNetworks, POPULAR_NAMES } from "@/libs/utils/networks";
import NetworksState from "@/libs/networks-state";
import scrollSettings from "@/libs/utils/scroll-settings";

interface NodeTypesWithActive extends NodeType {
  isActive: boolean;
}
const emit = defineEmits<{
  (e: "close:popup"): void;
  (e: "update:activeNetworks"): void;
}>();

const networksState = new NetworksState();

const all = ref<Array<NodeTypesWithActive>>([]);
const popular = ref<Array<NodeTypesWithActive>>([]);
let scrollProgress = ref(0);
const manageNetworkScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
const showTestNets = ref(false);

defineExpose({ manageNetworkScrollRef });

const getAllNetworksAndStatus = async () => {
  const activeNetworks = await networksState.getActiveNetworkNames();

  const allNetworks = getAllNetworks().map((net) => {
    return {
      ...net,
      isActive: activeNetworks.includes(net.name),
    };
  });

  return allNetworks;
};

onBeforeMount(async () => {
  const allNetworksNotTestNets = (await getAllNetworksAndStatus()).filter(
    ({ isTestNetwork }) => !isTestNetwork
  );

  const popularNetworks = allNetworksNotTestNets.filter((net) =>
    POPULAR_NAMES.includes(net.name)
  );

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

const search = (value: string) => {
  console.log(value);
};
const handleScroll = (e: any) => {
  let progress = Number(e.target.lastChild.style.top.replace("px", ""));
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

  &__wrap {
    background: @white;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    box-sizing: border-box;
    width: 460px;
    height: auto;
    z-index: 107;
    position: relative;
    max-height: 568px;
    overflow-x: hidden;
  }

  &__container {
    width: 800px;
    height: 600px;
    left: 0px;
    top: 0px;
    position: fixed;
    z-index: 105;
    display: flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  &__overlay {
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
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
