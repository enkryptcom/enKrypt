<template>
  <div v-if="fastList" class="swap-token-fast-list">
    <swap-token-fast-item
      v-for="(item, index) in fastList"
      :key="index"
      :token="item"
      v-bind="$attrs"
    />
    <div class="swap-token-fast-list__all">+{{ totalTokens }} tokens</div>
  </div>
</template>

<script setup lang="ts">
import SwapTokenFastItem from "./components/swap-token-fast-item.vue";
import { TokenTypeTo } from "@enkryptcom/swap";

interface IProps {
  fastList?: TokenTypeTo[];
  totalTokens?: number;
}

defineProps<IProps>();
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.swap-token-fast-list {
  width: 100%;
  padding: 3px 16px 4px 16px;
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
