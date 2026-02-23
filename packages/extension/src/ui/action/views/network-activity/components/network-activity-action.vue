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
        v-if="showExchange"
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
        v-if="showExchange"
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
const showExchange = !__IS_SAFARI__;

defineEmits<{
  (e: 'toggle:deposit'): void;
  (e: 'open:buyAction'): void;
}>();
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.network-activity {
  &__action {
    padding: 4px 20px 12px 20px;
    box-sizing: border-box;
    animation: fadeInUp 0.3s ease-out;
    animation-delay: 50ms;
    animation-fill-mode: backwards;

    &-wrap {
      width: 100%;
      height: 72px;
      border-radius: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: row;
      gap: 8px;
      background: @white;
      padding: 6px;
      box-sizing: border-box;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(0, 0, 0, 0.06);

      button,
      a {
        color: inherit;
        font: inherit;
        cursor: pointer;
        outline: inherit;
        border: none;
        background: transparent;
      }
    }

    &-item {
      background: rgba(0, 0, 0, 0.03);
      display: flex;
      text-align: center;
      text-decoration: none;
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.3px;
      color: @primaryLabel;
      cursor: pointer;
      height: 60px;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      max-width: 100%;
      transition: all 0.2s ease-in-out;
      border-radius: 10px;
      border: none;

      &:hover {
        background: rgba(98, 126, 234, 0.1);
      }

      &:active {
        background: rgba(98, 126, 234, 0.15);
      }

      svg {
        margin-bottom: 4px;
        opacity: 0.85;
      }

      &:focus {
        outline: none;
      }

      // Reset any router-link active styles
      &.router-link-active,
      &.router-link-exact-active {
        background: rgba(0, 0, 0, 0.03);

        &:hover {
          background: rgba(98, 126, 234, 0.1);
        }
      }
    }

    &-divider {
      height: 48px;
      width: 1px;
      background: rgba(0, 0, 0, 0.08);
      margin: 0 4px;
    }
  }
}
</style>
