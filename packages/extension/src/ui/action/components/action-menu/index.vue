<template>
  <div class="action-menu">
    <div class="action-menu__wrap">
      <!-- <a v-if="!isNft" class="action-menu__item" @click="buyAction">
        <Buy />Buy</a
      >
      <div v-if="!isNft" class="action-menu__divider"></div>
      <a v-if="!isNft" class="action-menu__item" @click="sendAction()">
        <Send />Send</a
      >
      <div v-if="!isNft" class="action-menu__divider"></div>
      <a v-if="!isNft" class="action-menu__item" @click="swapAction()">
        <Swap />Swap</a
      >
      <div v-if="false" class="action-menu__divider"></div> -->
      <a v-if="isNft" class="action-menu__item full" @click="linkAction()">
        <!-- <Rarible /> -->
        View NFT
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
// import Buy from "@action/icons/actions/buy.vue";
// import Send from "@action/icons/actions/send.vue";
// import Swap from "@action/icons/actions/swap.vue";
// import Rarible from "@/ui/action/icons/actions/rarible.vue";

defineProps({
  buyAction: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  sendAction: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  swapAction: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  linkAction: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  isNft: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.action-menu {
  box-sizing: border-box;

  &__wrap {
    width: 100%;
    height: 72px;
    background: @buttonBg;
    border-radius: 12px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: row;
    padding: 4px;
    box-sizing: border-box;
  }
  &__item {
    display: block;
    text-align: center;
    text-decoration: none;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    letter-spacing: 0.5px;
    color: @primaryLabel;
    cursor: pointer;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    min-width: 100px;
    transition: background 300ms ease-in-out;
    border-radius: 8px;

    &.full {
      width: 100%;

      svg {
        width: 24px;
        height: 24px;
      }
    }

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    svg {
      margin-bottom: 0;
    }
  }
  &__divider {
    height: 48px;
    width: 1px;
    background: @darkBg;
    margin: 0 4px 0 4px;
  }
}
</style>
