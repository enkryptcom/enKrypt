<template>
  <a class="send-subnet-select" @click="emit('update:toggleSubnetSelect')">
    <div class="send-subnet-select__info">
      <p>To chain:</p>
      <h5>{{ subnet!.name }}</h5>
    </div>

    <div class="send-subnet-select__arrow">
      <switch-arrow />
    </div>
  </a>
</template>

<script setup lang="ts">
import SwitchArrow from "@action/icons/header/switch_arrow.vue";
import { SubNetworkOptions } from "@/types/base-network";

const emit = defineEmits<{
  (e: "update:toggleSubnetSelect"): void;
}>();

interface IProps {
  subnet?: SubNetworkOptions | Partial<SubNetworkOptions>;
}

defineProps<IProps>();
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-subnet-select {
  height: 64px;
  background: #ffffff;
  margin: 0 32px 8px 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~"100% - 64px");
  padding: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;

  &__info {
    h5 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      width: 290px;
      margin: 0 0 1px 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @secondaryLabel;
      margin: 0;
      width: 290px;

      span {
        font-variant: small-caps;
      }
    }
  }

  &__arrow {
    position: absolute;
    font-size: 0;
    padding: 4px;
    right: 8px;
    top: 16px;
  }
}
</style>
