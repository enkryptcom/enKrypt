<template>
  <div class="hardware-select-account" :class="{ active: isChecked }">
    <div class="hardware-select-account__number">0</div>
    <img :src="require('@/ui/action/icons/raw/account.png')" />
    <div class="hardware-select-account__info">
      <p class="hardware-select-account__info-name">
        {{
          $filters.replaceWithEllipsis(
            "0x03502CF6C0A13167Dc2D0E25Dabf5FBDB68C5968",
            6,
            4
          )
        }}
      </p>
      <p class="hardware-select-account__info-amount">
        1.434
        <span>eth</span>
      </p>
    </div>
    <base-checkbox
      class="hardware-select-account__checkbox"
      :is-checked="isChecked"
      :check="check"
    ></base-checkbox>
  </div>
</template>

<script lang="ts">
export default {
  name: "HardwareSelectAccount",
};
</script>

<script setup lang="ts">
import BaseCheckbox from "@action/components/base-checkbox/index.vue";
import { PropType, ref } from "vue";

let isChecked = ref(false);

defineProps({
  select: {
    type: Function as PropType<() => void>,
    default: () => {
      return null;
    },
  },
});

const check = (isCheck: boolean) => {
  isChecked.value = isCheck;
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.hardware-select-account {
  height: 56px;
  background: #ffffff;
  margin: 0 0 4px 0;
  box-sizing: border-box;
  border-radius: 8px;
  padding: 6px 8px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  width: 100%;
  transition: background 300ms ease-in-out;

  &.active {
    background: @lightBg;
  }

  &:last-child {
    margin-bottom: 0;
  }

  &__number {
    width: 16px;
    height: 16px;
    font-family: "Roboto";
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @secondaryLabel;
  }

  img {
    width: 32px;
    height: 32px;
    margin-right: 16px;
    margin-left: 8px;
    border-radius: 50%;
  }

  &__info {
    &-name {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      margin: 0;
    }

    &-amount {
      display: block;
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: @secondaryLabel;
      letter-spacing: 0.5px;
      margin: 0;

      span {
        font-variant: small-caps;
      }
    }
  }

  &__checkbox {
    position: absolute;
    right: 9px;
    top: 50%;
    margin-top: -9px;
  }
}
</style>
