<template>
  <div class="network-header">
    <accounts-header-account
      v-if="!!selectedAccount"
      :name="selectedAccount.name"
      :address="network.displayAddress(selectedAccount.address)"
      :toggle-accounts="toggleAccounts"
      :active="showAccounts"
      @toggle:deposit="$emit('toggle:deposit')"
    />

    <accounts-list :show-accounts="showAccounts" :toggle="toggleAccounts" />

    <deposit
      v-if="!!selectedAccount"
      :account="selectedAccount"
      :show-deposit="showDeposit"
      @toggle:deposit="$emit('toggle:deposit')"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AccountsHeaderAccount from './components/header-accounts.vue';
import AccountsList from '@action/views/accounts/index.vue';
import Deposit from '@action/views/deposit/index.vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useNetworksStore } from '@action/store/networks-store';
import { useAccountsStore } from '@action/store/accounts-store';
const router = useRouter();
defineEmits<{
  (e: 'toggle:deposit'): void;
}>();
const showAccounts = ref(false);
const { currentNetwork: network } = storeToRefs(useNetworksStore());
const { selectedAccount } = storeToRefs(useAccountsStore());

defineProps({
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
@import '@action/styles/theme.less';

.network-header {
  position: fixed;
  width: 460px;
  height: 56px;
  top: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  box-shadow: 0 3px 3px -3px rgba(0, 0, 0, 0.16);
  z-index: 2;
}
</style>
