<template>
  <a @click="select" class="send-address-item">
    <div class="send-address-item__info">
      <img :src="getImgUrl(account.address)" alt="" />

      <div class="send-address-item__name">
        <h4>{{ account.name }}</h4>
        <p>{{ $filters.replaceWithEllipsis(account.address, 6, 4) }}</p>
      </div>
    </div>
  </a>
</template>

<script lang="ts">
export default {
  name: "SendAddressItem",
};
</script>

<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { Account } from "@action/types/account";

const props = defineProps({
  account: {
    type: Object as PropType<Account>,
    default: () => {
      return {};
    },
  },
  selectAccount: {
    type: Function,
    default: () => {
      return null;
    },
  },
});

const getImgUrl = (address: string) => {
  return "https://mewcard.mewapi.io/?address=" + address;
};

const select = () => {
  props.selectAccount(props.account)
}
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-address-item {
  text-decoration: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  width: 100%;
  height: 56px;
  cursor: pointer;
  text-decoration: none;

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
