<template>
  <div class="send-process-account">
    <img
      v-if="avatar"
      :src="avatar"
      class="send-process-account__img avatar"
      alt=""
    />
    <img
      v-else
      :src="network.identicon(network.displayAddress(address))"
      class="send-process-account__img avatar"
      alt=""
    />
    <div class="send-process-account__name">
      <p>To</p>
      <h4>{{ name ? name : network.displayAddress(address) }}</h4>
      <h6 v-show="!!name">
        {{
          $filters.replaceWithEllipsis(network.displayAddress(address), 6, 4)
        }}
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
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => {
      return {};
    },
  },
  avatar: {
    type: String,
    default: () => {
      return null;
    },
  },
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-process-account {
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 14px 16px;
  box-sizing: border-box;
  background: @white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);

  &__img {
    width: 36px;
    height: 36px;
    margin-right: 12px;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    object-fit: cover;
  }

  &__name {
    flex: 1;
    min-width: 0;

    p {
      font-style: normal;
      font-weight: 500;
      font-size: 11px;
      line-height: 14px;
      color: @tertiaryLabel;
      margin: 0 0 2px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    h4 {
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      color: @primaryLabel;
      margin: 0;
      word-break: break-all;
    }

    h6 {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: @secondaryLabel;
      margin: 2px 0 0 0;
      font-family: 'SF Mono', 'Roboto Mono', monospace;
      letter-spacing: -0.3px;
    }
  }
}
</style>
