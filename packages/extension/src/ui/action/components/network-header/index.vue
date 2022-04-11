<template>
  <div class="network-header">
    <network-header-account
      v-if="!!account"
      :name="account.name"
      :address="account.address"
      :toggle-accounts="toggleAccounts"
      :toggle-deposit="toggleDeposit"
      :active="showAccounts"
    ></network-header-account>

    <accounts-list :show-accounts="showAccounts" :toggle="toggleAccounts" />

    <deposit
      v-if="!!account"
      :account="account"
      :show-deposit="showDeposit"
      :toggle="toggleDeposit"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkHeader",
};
</script>

<script setup lang="ts">
import { PropType, onMounted, ref } from "vue";
import { Account } from "@action/types/account";
import NetworkHeaderAccount from "./components/network-header-account.vue";
import AccountsList from "@action/views/accounts/index.vue";
import Deposit from "@action/views/deposit/index.vue";
import { useRouter } from "vue-router";

const router = useRouter();

let showAccounts = ref(false);
let showDeposit = ref(false);

defineProps({
  selected: {
    type: Number,
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
});

onMounted(() => {
  router.beforeEach((to, from, next) => {
    showAccounts.value = false;
    next();
  });
});

const toggleAccounts = () => {
  showAccounts.value = !showAccounts.value;
};

const toggleDeposit = () => {
  showDeposit.value = !showDeposit.value;
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
  background: @white;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25);
  z-index: 2;
}
</style>
