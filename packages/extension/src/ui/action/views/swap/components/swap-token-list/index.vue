<template>
  <div class="swap-token-list">
    <div class="swap-token-list__header">
      <h3 v-if="!isSelectToToken">Select token to swap</h3>
      <h3 v-else>Select token to receive</h3>
      <a class="swap-token-list__close" @click="close">
        <close-icon />
      </a>
    </div>

    <swap-token-list-search></swap-token-list-search>

    <custom-scrollbar class="swap-token-list__scroll-area" :settings="settings">
      <div v-show="isSelectToToken" class="swap-token-list__fast-tokens">
        <swap-token-fast-list
          :select-token="selectToken"
        ></swap-token-fast-list>
      </div>
      <swap-token-list-item
        v-for="(item, index) in assets2"
        :key="index"
        :token="item"
        :select-token="selectToken"
      ></swap-token-list-item>
    </custom-scrollbar>
  </div>
</template>

<script lang="ts">
export default {
  name: "SwapTokenList",
};
</script>

<script setup lang="ts">
import CloseIcon from "@action/icons/common/close-icon.vue";
import SwapTokenListItem from "./components/swap-token-list-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import SwapTokenListSearch from "./components/swap-token-list-search.vue";
import SwapTokenFastList from "../swap-token-fast-list/index.vue";

import { assets2 } from "@action/types/mock";

const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};

const props = defineProps({
  close: {
    type: Function,
    default: () => {
      return null;
    },
  },
  selectToken: {
    type: Function,
    default: () => {
      return null;
    },
  },
  isSelectToToken: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});

const close = () => {
  props.close();
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.swap-token-list {
  width: 100%;
  background: #ffffff;
  position: fixed;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039), 0px 7px 24px rgba(0, 0, 0, 0.19);
  border-radius: 12px;
  width: 428px;
  height: 568px;
  left: 356px;
  top: 16px;
  z-index: 11;

  &__header {
    position: relative;
    padding: 14px 56px 14px 16px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      color: @primaryLabel;
      margin: 0;
    }
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 455px;
    margin: 0 0 8px 0;
    padding: 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }

    .ps__rail-y {
      right: 4px !important;
    }
  }

  &__fast-tokens {
    padding-top: 12px;

    .swap-token-fast-list__all {
      display: none;
    }
  }
}
</style>
