<template>
  <div class="chains" :class="{ show: showChains }">
    <div class="chains__overlay" />
    <div class="chains__wrap" :class="{ show: showChains }">
      <custom-scrollbar
        class="chains__scroll-area"
        :settings="scrollSettings({ suppressScrollX: true })"
      >
        <chainId-list-item
          v-for="(chain, index) in chains"
          :key="index"
          :chain="chain"
          :is-checked="selectedChain == chain"
          :select="selectChains"
        />
      </custom-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import { PropType } from "vue";
import scrollSettings from "@/libs/utils/scroll-settings";
import ChainIdListItem from "./chainId-list-item.vue";

const props = defineProps({
  chains: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  selectedChain: {
    type: String,
    default: "",
  },
  showChains: Boolean,
  selectChains: {
    type: Function,
    default: () => ({}),
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.chains {
  position: absolute;
  width: 800px;
  height: 600px;
  left: -340px;
  top: 0;
  z-index: 105;
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
    z-index: 106;
  }

  &__wrap {
    position: absolute;
    width: 100px;
    height: auto;
    max-height: 530px;
    left: 330px;
    top: 50px;
    background: #ffffff;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    z-index: 107;
    overflow: hidden;
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
    max-height: 420px;
  }

  &__info {
    padding: 24px 12px 0 60px;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @secondaryLabel;

    a {
      color: @primaryLabel;

      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
