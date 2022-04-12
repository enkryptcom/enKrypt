<template>
  <div class="send-contacts-list" :class="{ show: showAccounts }">
    <div class="send-contacts-list__overlay" @click="close"></div>
    <div class="send-contacts-list__wrap" :class="{ show: showAccounts }">
      <list-search :input="search" placeholder="Search contact" />
      <custom-scrollbar
        class="send-contacts-list__scroll-area"
        :settings="settings"
      >
        <h3>Recent</h3>
        <send-address-item
          v-for="(account, index) in accountsActive"
          :key="index"
          :account="account"
          :select-account="selectAccount"
        ></send-address-item>
        <h3>All Contacts</h3>
        <send-address-item
          v-for="(account, index) in accountsInActive"
          :key="index"
          :account="account"
          :select-account="selectAccount"
        ></send-address-item>
      </custom-scrollbar>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SendContactsList",
};
</script>

<script setup lang="ts">
import { defineProps } from "vue";
import SendAddressItem from "./send-address-item.vue";
import { accountsActive, accountsInActive } from "@action/types/mock";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import ListSearch from "@action/components/list-search/index.vue";
import { Account } from "@action/types/account";

const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};

const props = defineProps({
  showAccounts: Boolean,
  close: {
    type: Function,
    default: () => {
      return null;
    },
  },
  selectAccount: {
    type: Function,
    default: () => {
      return null;
    },
  },
});

const close = () => {
  props.close(false);
};

const search = (text: string) => {
  console.log(text);
};

const selectAccount = (account: Account) => {
  props.selectAccount(account);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-contacts-list {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 101;
  display: none;

  &.show {
    display: block;
  }

  &__overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 102;
  }

  &__wrap {
    position: absolute;
    width: 396px;
    height: auto;
    max-height: 530px;
    left: 32px;
    top: 146px;
    background: #ffffff;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    z-index: 103;
    overflow: hidden;
    padding-top: 56px;
    padding: 56px 0 0 16px;
    box-sizing: border-box;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0s ease-in-out 0.3s;

    &.show {
      opacity: 1;
      visibility: visible;
      transition-delay: 0s;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 380px;
  }

  h3 {
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: @secondaryLabel;
    margin: 24px 0 0 0;
  }
}
</style>
