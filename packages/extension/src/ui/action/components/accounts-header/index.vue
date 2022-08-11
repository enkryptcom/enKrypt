<template>
  <div class="network-header">
    <accounts-header-account
      v-if="!!accountInfo.selectedAccount"
      :name="accountInfo.selectedAccount.name"
      :address="network.displayAddress(accountInfo.selectedAccount.address)"
      :toggle-accounts="toggleAccounts"
      :active="showAccounts"
      :network="network"
      @toggle:deposit="$emit('toggle:deposit')"
    />

    <accounts-list
      :network="network"
      :account-info="accountInfo"
      :show-accounts="showAccounts"
      :toggle="toggleAccounts"
      v-bind="$attrs"
    />

    <deposit
      v-if="!!accountInfo.selectedAccount"
      :account="accountInfo.selectedAccount"
      :show-deposit="showDeposit"
      :network="network"
      @toggle:deposit="$emit('toggle:deposit')"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, PropType } from "vue";
import AccountsHeaderAccount from "./components/header-accounts.vue";
import AccountsList from "@action/views/accounts/index.vue";
import Deposit from "@action/views/deposit/index.vue";
import { useRouter } from "vue-router";
import type { AccountsHeaderData } from "@action/types/account";
import { BaseNetwork } from "@/types/base-network";
const router = useRouter();
defineEmits<{
  (e: "toggle:deposit"): void;
}>();
const showAccounts = ref(false);

defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
  showDeposit: Boolean,
});

onMounted(async () => {
  router.beforeEach((to, from, next) => {
    showAccounts.value = false;
    next();
  });
});

const toggleAccounts = () => {
  showAccounts.value = !showAccounts.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-header {
  position: fixed;
  width: 460px;
  height: 56px;
  left: 340px;
  top: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25);
  z-index: 2;
}
</style>
