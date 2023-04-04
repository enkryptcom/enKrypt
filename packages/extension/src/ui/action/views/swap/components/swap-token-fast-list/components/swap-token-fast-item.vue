<template>
  <a class="swap-token-fast__token" @click="$emit('update:selectAsset', token)">
    <img :src="token.logoURI" />
    <h4>{{ token.symbol }}</h4>
  </a>
</template>

<script setup lang="ts">
import { TokenTypeTo } from "@enkryptcom/swap";
import { PropType } from "vue";
defineEmits<{
  (e: "update:selectAsset", asset: TokenTypeTo): void;
}>();
defineProps({
  token: {
    type: Object as PropType<TokenTypeTo>,
    default: () => ({}),
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.swap-token-fast {
  &__token {
    height: 32px;
    padding: 8px;
    position: relative;
    border: 1px solid rgba(95, 99, 104, 0.2);
    box-sizing: border-box;
    border-radius: 8px;
    cursor: pointer;
    display: inline-block;
    margin-right: 12px;
    margin-bottom: 7px;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black004;
    }

    img {
      width: 16px;
      height: 16px;
      margin-right: 6px;
      border-radius: 100%;
      box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
      display: inline-block;
      vertical-align: middle;
    }

    h4 {
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      color: @primaryLabel;
      margin: 0;
      text-transform: uppercase;
      display: inline-block;
      vertical-align: middle;
    }
  }
}
</style>
