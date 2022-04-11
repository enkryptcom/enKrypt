<template>
  <div class="select-account-item">
    <div class="select-account-item__info">
      <div class="select-account-item__number">{{ number }}</div>
      <img :src="getImgUrl(account.address)" />

      <div class="select-account-item__name">
        <h4>{{ $filters.replaceWithEllipsis(account.address, 6, 4) }}</h4>
        <p>
          {{ account.amount }} <span>{{ account.primaryToken.symbol }}</span>
        </p>
      </div>
    </div>

    <div class="select-account-item__action">
      <BaseCheckbox :check="check" :is-checked="isActive" />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SelectAccountItem",
};
</script>

<script setup lang="ts">
import { PropType } from "vue";
import { Account } from "@action/types/account";
import BaseCheckbox from "@action/components/base-checkbox/index.vue";

defineProps({
  account: {
    type: Object as PropType<Account>,
    default: () => {
      return {};
    },
  },
  isActive: Boolean,
  number: {
    type: Number,
    default: 0,
  },
});

const check = (isChecked: boolean) => {
  console.log(isChecked);
};

const getImgUrl = (address: string) => {
  return "https://mewcard.mewapi.io/?address=" + address;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.select-account-item {
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  height: 56px;

  &__number {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @secondaryLabel;
    width: 24px;
  }

  &__info {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    height: 56px;

    img {
      width: 32px;
      height: 32px;
      margin-right: 16px;
      margin-left: 8px;
      border-radius: 100%;
    }
  }

  &__name {
    h4 {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      margin: 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @secondaryLabel;
      margin: 0 !important;

      span {
        font-variant: small-caps;
      }
    }
  }

  &__action {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    a {
      display: inline-block;
      font-size: 0;
      margin-right: 10px;
    }
  }
}
</style>
