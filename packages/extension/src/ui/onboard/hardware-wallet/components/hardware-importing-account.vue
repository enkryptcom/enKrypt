<template>
  <div class="hardware-importing-account">
    <div class="hardware-importing-account__wrap">
      <div class="hardware-importing-account__number">0</div>
      <img :src="require('@/ui/action/icons/raw/account.png')" />
      <div class="hardware-importing-account__info">
        <p class="hardware-importing-account__info-name">
          {{
            $filters.replaceWithEllipsis(
              "0x03502CF6C0A13167Dc2D0E25Dabf5FBDB68C5968",
              6,
              4
            )
          }}
        </p>
        <p class="hardware-importing-account__info-amount">
          1.434
          <span>eth</span>
        </p>
      </div>
    </div>

    <label-input
      type="text"
      label="Account nickname"
      class="hardware-importing-account__input"
      :value="name"
      @update:value="nameChanged"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "HardwareImportingAccount",
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import LabelInput from "@action/components/label-input/index.vue";

const name = ref("EVM Ethereum Ledger 1");

const nameChanged = (newVal: string) => {
  name.value = newVal;
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.hardware-importing-account {
  margin: 0 0 16px 0;

  &__wrap {
    height: 56px;
    background: #ffffff;
    box-sizing: border-box;
    border-radius: 8px;
    padding: 6px 8px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    position: relative;
    text-decoration: none;
    width: 100%;
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
