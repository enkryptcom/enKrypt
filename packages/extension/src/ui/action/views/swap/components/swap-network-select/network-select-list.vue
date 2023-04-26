<template>
  <div class="assets-select-list">
    <div class="assets-select-list__header">
      <h3>Select to Network</h3>
      <a class="assets-select-list__close" @click="close">
        <close-icon />
      </a>
    </div>

    <custom-scrollbar
      class="assets-select-list__scroll-area"
      :settings="scrollSettings({ suppressScrollX: true })"
    >
      <network-select-list-item
        v-for="(item, index) in assets"
        :key="index"
        :token="item"
        v-bind="$attrs"
      />
    </custom-scrollbar>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from "@action/icons/common/close-icon.vue";
import NetworkSelectListItem from "./network-select-list-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import scrollSettings from "@/libs/utils/scroll-settings";
import { PropType } from "vue";
import { NetworkInfo } from "@enkryptcom/swap";

const emit = defineEmits<{
  (e: "close", close: boolean): void;
}>();

defineProps({
  assets: {
    type: Array as PropType<NetworkInfo[]>,
    default: () => [],
  },
});

const close = () => {
  emit("close", false);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.assets-select-list {
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
    transition: background 300ms ease-in-out;

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
