<template>
  <div class="accounts" :class="{ show: showAccounts }">
    <div class="accounts__overlay" @click="close()"></div>
    <div class="accounts__wrap" :class="{ show: showAccounts }">
      <accounts-search />
      <custom-scrollbar class="accounts__scroll-area" :settings="settings">
        <accounts-list-item
          v-for="(account, index) in active"
          :key="index"
          :name="account.name"
          :address="account.address"
          :amount="account.amount"
          :symbol="account.primaryToken.symbol"
          :is-checked="address == account.address"
          :select="select"
          :active="true"
        ></accounts-list-item>

        <div class="accounts__info">
          Incompatible accounts <a href="#">why?</a>
        </div>

        <accounts-list-item
          v-for="(account, index) in inActive"
          :key="index"
          :name="account.name"
          :address="account.address"
          :amount="account.amount"
          :symbol="account.primaryToken.symbol"
          :is-checked="address == account.address"
          :select="select"
          :active="false"
        ></accounts-list-item>
      </custom-scrollbar>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "AccountsList",
};
</script>

<script setup lang="ts">
import AccountsSearch from "./components/accounts-search.vue";
import AccountsListItem from "./components/accounts-list-item.vue";
import { useRoute } from "vue-router";
import { accountsActive, accountsInActive } from "@action/types/mock";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";

const route = useRoute();

const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};
const active = accountsActive;
const inActive = accountsInActive;
const address = route.params.address;

const props = defineProps({
  showAccounts: Boolean,
  toggle: {
    type: Function,
    default: () => ({}),
  },
});

const close = () => {
  setTimeout(() => {
    props.toggle();
  }, 300);
};
const select = (account: string) => {
  changeAccount(account);

  setTimeout(() => {
    props.toggle();
  }, 300);
};
const changeAccount = (account: string) => {
  console.log("change account button clicked", account);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.accounts {
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
    width: 344px;
    height: auto;
    max-height: 530px;
    left: 8px;
    top: 50px;
    background: #ffffff;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    z-index: 103;
    overflow: hidden;
    padding-top: 56px;
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
    max-height: 476px;
  }

  &__info {
    padding: 12px;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @secondaryLabel;

    a {
      color: @primaryLabel;

      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
