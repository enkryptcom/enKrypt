<template>
  <div class="verify-transaction-account">
    <img
      v-if="avatar"
      :src="avatar"
      class="verify-transaction-account__img avatar"
      alt=""
    />
    <img
      v-else
      :src="network.identicon(address)"
      class="verify-transaction-account__img"
      :class="{ avatar: !from }"
      alt=""
    />

    <div class="verify-transaction-account__name">
      <p v-if="from">From</p>
      <p v-else>To</p>
      <h4>{{ name ? name : address }}</h4>
      <h6 v-show="!!name">
        {{ $filters.replaceWithEllipsis(address, 6, 4) }}
      </h6>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseNetwork } from '@/types/base-network';
import { PropType } from 'vue';

defineProps({
  address: {
    type: String,
    default: () => {
      return '';
    },
  },
  name: {
    type: String,
    default: () => {
      return null;
    },
  },
  avatar: {
    type: String,
    default: () => {
      return null;
    },
  },
  from: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => {
      return {};
    },
  },
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.verify-transaction-account {
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 14px 16px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: background 150ms ease-in-out;

  &:hover {
    background: rgba(0, 0, 0, 0.01);
  }

  &__img {
    width: 36px;
    height: 36px;
    margin-right: 12px;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  &__name {
    flex: 1;
    min-width: 0;

    h4 {
      font-style: normal;
      font-weight: 600;
      font-size: 15px;
      line-height: 20px;
      color: @primaryLabel;
      margin: 0;
      word-break: break-all;
    }

    p {
      font-style: normal;
      font-weight: 500;
      font-size: 11px;
      line-height: 14px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: @secondaryLabel;
      margin: 0 0 2px 0;
    }

    h6 {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: @tertiaryLabel;
      margin: 2px 0 0 0;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
    }
  }
}
</style>
