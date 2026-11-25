<template>
  <AppModal v-model="isOpen" title="Accounts" class="w-full h-full">
    <div class="flex flex-col gap-2">
      <AppSearchbar
        v-model="searchInput"
        variant="default"
        placeholder="Search Accounts"
        :debounce="300"
      />

      <div class="overscroll-y-aut">
        <accounts-list-item
          v-for="(account, index) in displayActive"
          :key="index"
          :name="account.name"
          :address="network.displayAddress(account.address)"
          :amount="accountInfo.activeBalances[index]"
          :symbol="network.currencyName"
          :is-checked="accountInfo.selectedAccount?.address == account.address"
          :select="selectAccount"
          :active="true"
          :identicon-element="network.identicon"
          :show-edit="true"
          :deletable="account.walletType !== WalletType.mnemonic"
          @action:rename="renameAccount(index)"
          @action:delete="deleteAccount(index)"
        />

        <p
          v-if="displayInactive.length > 0"
          class="pt-6 pr-3 pl-[60px] text-text-xs leading-4 tracking-[0.5px] text-text-subtle"
        >
          Incompatible accounts
        </p>

        <accounts-list-item
          v-for="(account, index) in displayInactive"
          :key="index"
          :name="account.name"
          :address="account.address"
          :is-checked="false"
          :active="false"
          :identicon-element="network.identicon"
        />
        <p
          v-if="displayInactive.length === 0 && displayActive.length === 0"
          class="pt-6 pr-3 pl-[60px] text-text-xs leading-4 tracking-[0.5px] text-text-subtle"
        >
          Accounts not found
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col">
        <button
          type="button"
          :class="ACTION_BUTTON_CLASS"
          @click="addAccountAction()"
        >
          <add-account />
          Add account
        </button>

        <div
          v-if="
            hwWallet.isNetworkSupported(network.name) ||
            network.signer[0] === SignerType.secp256k1
          "
          class="my-2 h-px w-full bg-border-default"
        />

        <button
          v-if="hwWallet.isNetworkSupported(network.name)"
          type="button"
          :class="ACTION_BUTTON_CLASS"
          @click="openHardware(network.name)"
        >
          <add-hardware-account />
          Add hardware wallet account
        </button>

        <button
          v-if="network.provider !== ProviderName.kadena"
          type="button"
          :class="ACTION_BUTTON_CLASS"
          @click="importAction"
        >
          <import-account-icon />
          Import account from another wallet
        </button>
      </div>
    </template>
  </AppModal>

  <add-account-form v-model="isAddAccount" v-bind="$attrs" :network="network" />

  <rename-account-form
    v-if="isRenameAccount"
    v-model="isRenameAccount"
    v-bind="$attrs"
    :account="accountToRename"
    :network="network"
  />

  <delete-account-form
    v-if="isDeleteAccount"
    v-model="isDeleteAccount"
    v-bind="$attrs"
    :account="accountToDelete"
  />

  <import-account
    v-bind="$attrs"
    v-model="isImportAccount"
    :network="network"
  />
</template>

<script setup lang="ts">
import AccountsListItem from './components/accounts-list-item.vue';
import AddAccount from '@action/icons/common/add-account.vue';
import AddAccountForm from './components/add-account-form.vue';
import RenameAccountForm from './components/rename-account-form.vue';
import DeleteAccountForm from './components/delete-account-form.vue';
import AddHardwareAccount from '@action/icons/actions/add-hardware-account.vue';
import ImportAccountIcon from '@action/icons/actions/import-account-icon.vue';
import ImportAccount from '@action/views/import-account/index.vue';
import AppSearchbar from '@common/components/input/AppSearchbar.vue';
import AppModal from '@common/components/modal/AppModal.vue';
import { AccountsHeaderData } from '../../types/account';
import { PropType, ref, computed } from 'vue';
import openHardware from '@/libs/utils/open-hardware';
import { EnkryptAccount } from '@enkryptcom/types';
import HWwallets from '@enkryptcom/hw-wallets';
import { SignerType } from '@enkryptcom/types';
import { BaseNetwork } from '@/types/base-network';
import { WalletType } from '@enkryptcom/types';
import { ProviderName } from '@/types/provider';

const ACTION_BUTTON_CLASS =
  'flex h-10 w-full cursor-pointer items-center gap-2 rounded-12 py-2.5 pr-4 pl-2 text-left text-text-sm tracking-[0.25px] text-text-default transition-colors duration-300 hover:bg-background-default-hover';

const emit = defineEmits<{
  (e: 'addressChanged', account: EnkryptAccount): void;
}>();
const isAddAccount = ref(false);
const isRenameAccount = ref(false);
const isDeleteAccount = ref(false);
const isImportAccount = ref(false);
const hwWallet = new HWwallets();
const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
  showAccounts: Boolean,
  toggle: {
    type: Function,
    default: () => ({}),
  },
});
const accountToRename = ref<EnkryptAccount>();
const accountToDelete = ref<EnkryptAccount>();

// The header owns the open state (`showAccounts` + `toggle`); bridge it to
// AppModal's v-model so Esc, backdrop and the close button all go through it.
const isOpen = computed({
  get: () => props.showAccounts,
  set: open => {
    if (open !== props.showAccounts) props.toggle();
  },
});
const selectAccount = (address: string) => {
  for (const acc of props.accountInfo.activeAccounts) {
    if (props.network.displayAddress(acc.address) === address) {
      emit('addressChanged', acc);
      break;
    }
  }
  setTimeout(() => {
    props.toggle();
  }, 100);
};
const addAccountAction = () => {
  props.toggle();

  setTimeout(() => {
    isAddAccount.value = true;
  }, 100);
};

const renameAccount = (accountIdx: number) => {
  accountToRename.value = props.accountInfo.activeAccounts[accountIdx];
  props.toggle();
  setTimeout(() => {
    isRenameAccount.value = true;
  }, 100);
};

const deleteAccount = (accountIdx: number) => {
  accountToDelete.value = props.accountInfo.activeAccounts[accountIdx];
  props.toggle();

  setTimeout(() => {
    isDeleteAccount.value = true;
  }, 100);
};
const importAction = () => {
  props.toggle();

  setTimeout(() => {
    isImportAccount.value = true;
  }, 100);
};

/*
  ========================
    Search
  ========================
*/
const searchInput = ref('');

function filterAndSortAccounts(accounts: EnkryptAccount[]) {
  // Filter accounts where the name or address contains inputText
  const filteredAccounts = accounts.filter(
    account =>
      account.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
      account.address.toLowerCase().includes(searchInput.value.toLowerCase()),
  );

  // Sort the filtered accounts
  return filteredAccounts.sort((a, b) => {
    const aNameStartsWith = a.name
      .toLowerCase()
      .startsWith(searchInput.value.toLowerCase());
    const bNameStartsWith = b.name
      .toLowerCase()
      .startsWith(searchInput.value.toLowerCase());
    const aAddressStartsWith = a.address
      .toLowerCase()
      .startsWith(searchInput.value.toLowerCase());
    const bAddressStartsWith = b.address
      .toLowerCase()
      .startsWith(searchInput.value.toLowerCase());

    // Prioritize objects that start with searchInput.value
    if (aNameStartsWith || aAddressStartsWith) {
      if (!(bNameStartsWith || bAddressStartsWith)) {
        return -1; // a starts with searchInput.value, b does not
      }
    } else if (bNameStartsWith || bAddressStartsWith) {
      return 1; // b starts with searchInput.value, a does not
    }

    // If both or neither start with searchInput.value, sort alphabetically
    const aPrimary = (
      a.name.toLowerCase().startsWith(searchInput.value.toLowerCase())
        ? a.name
        : a.address
    ).toLowerCase();
    const bPrimary = (
      b.name.toLowerCase().startsWith(searchInput.value.toLowerCase())
        ? b.name
        : b.address
    ).toLowerCase();

    return aPrimary.localeCompare(bPrimary);
  });
}

const displayActive = computed(() => {
  if (!searchInput.value || searchInput.value === '') {
    return props.accountInfo.activeAccounts;
  }
  return filterAndSortAccounts(props.accountInfo.activeAccounts);
});
const displayInactive = computed(() => {
  if (!searchInput.value || searchInput.value === '') {
    return props.accountInfo.inactiveAccounts;
  }
  return filterAndSortAccounts(props.accountInfo.inactiveAccounts);
});
</script>
