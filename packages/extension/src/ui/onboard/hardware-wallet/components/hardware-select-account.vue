<template>
  <div
    class="hardware-select-account"
    :class="{ active: selected, imported: disabled }"
  >
    <div class="hardware-select-account__number">
      {{ index }}
    </div>
    <img :src="network.identicon(address)" />
    <div class="hardware-select-account__info">
      <p class="hardware-select-account__info-name">
        {{
          $filters.replaceWithEllipsis(network.displayAddress(address), 6, 4)
        }}
        {{ disabled ? " (imported)" : "" }}
      </p>
      <p class="hardware-select-account__info-amount">
        {{ balance }}
        <span>{{ network.currencyName }}</span>
      </p>
    </div>
    <base-checkbox
      class="hardware-select-account__checkbox"
      :is-checked="selected"
      :disabled="disabled"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
import { BaseNetwork } from "@/types/base-network";
import BaseCheckbox from "@action/components/base-checkbox/index.vue";
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
  selected: {
    type: Boolean,
    default: false,
  },
  index: {
    type: Number,
    default: 0,
  },
  balance: {
    type: String,
    default: "",
  },
  disabled: Boolean,
});
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
  &.imported {
    background: #e6ede7;
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
