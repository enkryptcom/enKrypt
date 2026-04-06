<template>
  <div class="verify-transaction-network">
    <img :src="network.icon" alt="" />

    <div class="verify-transaction-network__name">
      <p>Network</p>
      <h4>{{ network.name_long }}</h4>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { BaseNetwork } from '@/types/base-network';

defineProps({
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

.verify-transaction-network {
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 14px 16px;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(
    135deg,
    rgba(98, 126, 234, 0.04) 0%,
    rgba(138, 100, 220, 0.02) 100%
  );

  img {
    width: 36px;
    height: 36px;
    margin-right: 12px;
    object-fit: contain;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  &__name {
    h4 {
      font-style: normal;
      font-weight: 600;
      font-size: 15px;
      line-height: 20px;
      color: @primaryLabel;
      margin: 0;
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
  }
}
</style>
