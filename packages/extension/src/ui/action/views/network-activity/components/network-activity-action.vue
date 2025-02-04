<template>
  <div class="network-activity__action">
    <div class="network-activity__action-wrap">
      <button
        class="network-activity__action-item"
        @click="$emit('toggle:deposit')"
      >
        <Deposit />Deposit
      </button>
      <button
        class="network-activity__action-item"
        @click="$emit('open:buyAction')"
      >
        <Buy />Buy/Sell
      </button>
      <router-link
        :to="{
          name: 'send-transaction',
          params: { id: route.params.id, isToken: 'true' },
        }"
        class="network-activity__action-item"
      >
        <Send />Send
      </router-link>
      <router-link
        class="network-activity__action-item"
        :to="{
          name: 'swap',
          params: { id: route.params.id },
        }"
      >
        <Swap />Swap
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import Deposit from '@action/icons/actions/deposit.vue';
import Buy from '@action/icons/actions/buy.vue';
import Send from '@action/icons/actions/send.vue';
import Swap from '@action/icons/actions/swap.vue';
import { useRoute } from 'vue-router';
const route = useRoute();

defineEmits<{
  (e: 'toggle:deposit'): void;
  (e: 'open:buyAction'): void;
}>();
</script>

<style lang="less">
@import '@action/styles/theme.less';

.network-activity {
  &__action {
    padding: 4px 16px 8px 16px;
    box-sizing: border-box;

    &-wrap {
      width: 100%;
      height: 72px;
      left: 12px;
      top: 0px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: row;
      gap: 8px;
      button {
        color: inherit;
        font: inherit;
        cursor: pointer;
        outline: inherit;
        border: inherit;
      }
    }
    &-item {
      background: @primary007;
      display: block;
      text-align: center;
      text-decoration: none;
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      text-align: center;
      letter-spacing: 0.5px;
      color: @primaryLabel;
      cursor: pointer;
      height: 72px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      flex: 1;
      min-width: 100px;
      max-width: 100%;
      transition: background 300ms ease-in-out;
      border-radius: 12px;

      &:hover {
        background: @black004;
      }

      svg {
        margin-bottom: 0;
        margin-bottom: 2px;
      }
      &:focus {
        outline: -webkit-focus-ring-color auto 1px !important;
        outline-offset: 2px !important;
      }
    }
    &-divider {
      height: 48px;
      width: 1px;
      background: @darkBg;
      margin: 0 4px 0 4px;
    }
  }
}
</style>
