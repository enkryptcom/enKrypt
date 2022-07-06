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
import { PropType } from "vue";
import { BaseNetwork } from "@/types/base-network";

defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => {
      return {};
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.verify-transaction-network {
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;
  border-bottom: 1px solid @gray02;

  img {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }

  &__name {
    h4 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      margin: 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      color: @secondaryLabel;
      margin: 0;
    }
  }
}
</style>
