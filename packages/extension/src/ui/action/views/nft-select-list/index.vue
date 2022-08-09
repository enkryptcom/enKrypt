<template>
  <div class="nft-select-list">
    <div class="nft-select-list__header">
      <h3>Select NFT to send</h3>
      <a class="nft-select-list__close" @click="close">
        <close-icon />
      </a>
    </div>

    <nft-select-list-search />

    <custom-scrollbar
      class="nft-select-list__scroll-area"
      :settings="scrollSettings({ suppressScrollX: true })"
    >
      <nft-select-list-item
        v-for="(item, index) in nftList"
        :key="index"
        :item="item"
        :select-item="selectItem"
      />
    </custom-scrollbar>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from "@action/icons/common/close-icon.vue";
import NftSelectListItem from "./components/nft-select-list-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import NftSelectListSearch from "./components/nft-select-list-search.vue";
import scrollSettings from "@/libs/utils/scroll-settings";
import { nftList } from "@action/types/mock";

const props = defineProps({
  close: {
    type: Function,
    default: () => {
      return null;
    },
  },
  selectItem: {
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
  isSend: {
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

.nft-select-list {
  width: 100%;
  background: #ffffff;
  position: fixed;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039), 0px 7px 24px rgba(0, 0, 0, 0.19);
  border-radius: 12px;
  width: 428px;
  height: 568px;
  left: 356px;
  top: 16px;
  z-index: 12;

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
}
</style>
