<template>
  <div class="swap-token-fast-list">
    <swap-token-fast-item
      v-for="(item, index) in assets3"
      :key="index"
      :token="item"
      :select-token="selectToken"
    ></swap-token-fast-item>
    <div class="swap-token-fast-list__all">+1245 tokens</div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SwapTokenFastList",
};
</script>

<script setup lang="ts">
import SwapTokenFastItem from "./components/swap-token-fast-item.vue";
import { assets3 } from "@action/types/mock";

defineProps({
  selectToken: {
    type: Function,
    default: () => {
      return null;
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.swap-token-fast-list {
  width: 100%;
  padding: 0px 16px 4px 16px;
  box-sizing: border-box;

  &__all {
    display: inline-block;
    vertical-align: middle;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 32px;
    letter-spacing: 0.25px;
    color: @secondaryLabel;
  }
}
</style>
