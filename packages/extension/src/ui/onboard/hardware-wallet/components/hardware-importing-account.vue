<template>
  <div class="hardware-importing-account">
    <div class="hardware-importing-account__wrap">
      <div v-if="!noIndex" class="hardware-importing-account__number">
        {{ index }}
      </div>
      <img :src="network.identicon ? network.identicon(address) : ''" />
      <div class="hardware-importing-account__info">
        <p class="hardware-importing-account__info-name">
          {{
            $filters.replaceWithEllipsis(
              network.displayAddress ? network.displayAddress(address) : "",
              6,
              4
            )
          }}
        </p>
        <p class="hardware-importing-account__info-amount">
          {{ balance }}
          <span>{{ network.currencyName ? network.currencyName : "" }}</span>
        </p>
      </div>
    </div>

    <label-input
      type="text"
      label="Account nickname"
      class="hardware-importing-account__input"
      :value="nameValue"
      :is-error="isError"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
import LabelInput from "@action/components/label-input/index.vue";
import { BaseNetwork } from "@/types/base-network";
import { PropType } from "vue";
defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  address: {
    type: String,
    default: "",
  },
  index: {
    type: Number,
    default: 0,
  },
  balance: {
    type: String,
    default: "",
  },
  nameValue: {
    type: String,
    default: "",
  },
  isError: Boolean,
  noIndex: Boolean,
});
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
