<template>
  <div class="network-activity__action">
    <div class="network-activity__action-wrap">
      <a
        class="network-activity__action-item"
        @click="(depositAction as ()=>void)"
      >
        <Deposit />Deposit
      </a>
      <div class="network-activity__action-devider"></div>
      <a class="network-activity__action-item" @click="(buyAction as ()=>void)">
        <Buy />Buy
      </a>
      <div class="network-activity__action-devider"></div>
      <router-link
        :to="{
          name: 'send-transaction',
          params: { id: !!selected ? selected : null },
        }"
        class="network-activity__action-item"
        @click="(sendAction as ()=>void)"
      >
        <Send />Send
      </router-link>
      <div class="network-activity__action-devider"></div>
      <router-link
        class="network-activity__action-item"
        :to="{
          name: 'swap',
          params: { id: !!selected ? selected : null },
        }"
      >
        <Swap />Swap
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkActivityAction",
};
</script>

<script setup lang="ts">
import Deposit from "@action/icons/actions/deposit.vue";
import Buy from "@action/icons/actions/buy.vue";
import Send from "@action/icons/actions/send.vue";
import Swap from "@action/icons/actions/swap.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const selected: string = route.params.id as string;

defineProps({
  depositAction: {
    type: Function,
    default: () => ({}),
  },
  buyAction: {
    type: Function,
    default: () => ({}),
  },
  sendAction: {
    type: Function,
    default: () => ({}),
  },
  swapAction: {
    type: Function,
    default: () => ({}),
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-activity {
  &__action {
    padding: 0 12px 8px 12px;
    box-sizing: border-box;

    &-wrap {
      width: 100%;
      height: 72px;
      left: 12px;
      top: 0px;
      background: @buttonBg;
      border-radius: 12px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-direction: row;
      padding: 4px;
      box-sizing: border-box;
    }
    &-item {
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

      &:hover {
        background: rgba(0, 0, 0, 0.04);
        border-radius: 8px;
      }

      svg {
        margin-bottom: 0;
      }
    }
    &-devider {
      height: 48px;
      width: 1px;
      background: @darkBg;
      margin: 0 4px 0 4px;
    }
  }
}
</style>
