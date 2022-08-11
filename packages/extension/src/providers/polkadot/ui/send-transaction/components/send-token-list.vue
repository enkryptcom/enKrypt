<template>
  <div class="send-token-list" :class="{ show: showTokens }">
    <div class="send-token-list__overlay" @click="close" />
    <div class="send-token-list__wrap" :class="{ show: showTokens }">
      <list-search :input="search" placeholder="Search asset" />
      <custom-scrollbar
        class="send-token-list__scroll-area"
        :settings="settings"
      >
        <send-token-item
          v-for="(token, index) in searchAssets"
          :key="`${token.symbol}-${index}`"
          :token="token"
          :select-token="selectToken"
          :active-account="activeAccount"
          :api="props.api"
        />
      </custom-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import SendTokenItem from "./send-token-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import ListSearch from "@action/components/list-search/index.vue";
import { BaseToken } from "@/types/base-token";
import EvmAPI from "@/providers/ethereum/libs/api";
import { ApiPromise } from "@polkadot/api";
import { onUpdated, ref } from "vue";
import { AssetsType } from "@/types/provider";

interface IProps {
  showTokens: boolean;
  close: (shouldClose: boolean) => void;
  selectToken: (token: AssetsType | Partial<AssetsType>) => void;
  activeAccount?: string;
  api?: EvmAPI | ApiPromise;
  assets: AssetsType[] | Partial<AssetsType>[];
}

const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};

const props = defineProps<IProps>();

const searchAssets = ref<AssetsType[] | Partial<AssetsType>[]>(props.assets);

onUpdated(() => {
  searchAssets.value = props.assets;
});

const close = () => {
  props.close(false);
};

const search = (searchParam: string) => {
  if (searchParam === "") {
    searchAssets.value = props.assets;
  } else {
    const lowerSearchParam = searchParam.toLowerCase();
    searchAssets.value = props.assets.filter(
      (asset) =>
        asset.name?.toLowerCase().startsWith(lowerSearchParam) ||
        asset.symbol?.toLowerCase().startsWith(lowerSearchParam)
    );
  }
};

const selectToken = (token: BaseToken) => {
  props.selectToken(token);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-token-list {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 101;
  display: none;

  &.show {
    display: block;
  }

  &__overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 102;
  }

  &__wrap {
    position: absolute;
    width: 396px;
    height: auto;
    max-height: 530px;
    left: 32px;
    top: 218px;
    background: #ffffff;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    z-index: 103;
    overflow: hidden;
    padding-top: 56px;
    padding: 56px 0 0 16px;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0s ease-in-out 0.3s;

    &.show {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 308px;
  }
}
</style>
