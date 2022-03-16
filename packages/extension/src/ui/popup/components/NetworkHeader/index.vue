<template>
  <div class="network-header">
    <AccountItem
      v-if="!!account"
      :name="account.name"
      :address="account.address"
      :toggle-accounts="toggleAccounts"
      :toggle-deposit="toggleDeposit"
      :active="showAccounts"
    ></AccountItem>

    <AccountsList :show-accounts="showAccounts" :toggle="toggleAccounts" />

    <Deposit
      v-if="!!account"
      :account="account"
      :show-deposit="showDeposit"
      :toggle="toggleDeposit"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { NetworkItem } from "@popup/types/network";
import { Account } from "@popup/types/account";
import AccountItem from "./components/Account.vue";
import AccountsList from "@popup/views/accounts/index.vue";
import Deposit from "@popup/views/deposit/index.vue";

export default defineComponent({
  name: "NetworkHeader",
  components: {
    AccountItem,
    AccountsList,
    Deposit,
  },
  props: {
    selected: {
      type: Object as PropType<NetworkItem>,
      default: () => {
        return {};
      },
    },
    account: {
      type: Object as PropType<Account>,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      showAccounts: false,
      showDeposit: false,
    };
  },
  created() {
    this.$router.beforeEach((to, from, next) => {
      this.showAccounts = false;
      next();
    });
  },
  methods: {
    toggleAccounts() {
      this.showAccounts = !this.showAccounts;
    },
    toggleDeposit() {
      this.showDeposit = !this.showDeposit;
    },
  },
});
</script>

<style lang="less">
@import "~@popup/styles/theme.less";

.network-header {
  position: fixed;
  width: 460px;
  height: 56px;
  left: 340px;
  top: 0;
  background: @white;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25);
  z-index: 2;
}
</style>
