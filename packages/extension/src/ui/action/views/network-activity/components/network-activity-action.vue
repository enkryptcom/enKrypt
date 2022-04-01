<template>
  <div class="network-activity__action">
    <div class="network-activity__action-wrap">
      <a
        class="network-activity__action-item"
        @click="(depositAction as (e: MouseEvent)=>void)"
      >
        <Deposit /><br />Deposit
      </a>
      <div class="network-activity__action-devider"></div>
      <a
        class="network-activity__action-item"
        @click="(buyAction as (e: MouseEvent)=>void)"
      >
        <Buy /><br />Buy
      </a>
      <div class="network-activity__action-devider"></div>
      <router-link
        :to="{
          name: 'send-transaction',
          params: { networkId: !!selected ? selected : null },
        }"
        class="network-activity__action-item"
      >
        <Send /><br />Send
      </router-link>
      <div class="network-activity__action-devider"></div>
      <a
        class="network-activity__action-item"
        @click="(swapAction as (e: MouseEvent)=>void)"
      >
        <Swap /><br />Swap
      </a>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkActivityAction",
};
</script>

<script setup lang="ts">
import { defineProps } from "vue";
import Deposit from "@action/icons/actions/deposit.vue";
import Buy from "@action/icons/actions/buy.vue";
import Send from "@action/icons/actions/send.vue";
import Swap from "@action/icons/actions/swap.vue";
import { useRoute } from "vue-router";

const route = useRoute();

const selected = +route.params.networkId;

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
      width: 100px;
      cursor: pointer;

      svg {
        margin-bottom: 0;
      }
    }

    &-devider {
      height: 48px;
      width: 1px;
      background: @darkBg;
    }
  }
}
</style>
