<template>
  <!-- The accounts list, deposit and settings are modals teleported to
       #app, so their position doesn't depend on this header. -->
  <header class="flex w-full items-center gap-2">
    <!-- Account row: `relative` anchors the copy notification and the
         subnetwork list; z-[104] keeps that list above the page content. -->
    <div
      v-if="accountInfo.selectedAccount"
      class="relative z-[104] flex h-14 min-w-0 flex-1 items-center justify-between rounded-12 p-1.5"
    >
      <!-- Account switcher -->
      <button
        type="button"
        :aria-expanded="showAccounts"
        :aria-label="`Switch account, current: ${accountInfo.selectedAccount.name}`"
        class="inline-flex h-10 min-w-0 shrink-0 cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-full border border-border-default bg-background-alternative pr-2.5 pl-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus"
        :class="{ 'hover:bg-background-default': !showAccounts }"
        @click="toggleAccounts"
      >
        <AppAvatar
          type="account"
          size="s"
          :address="address"
          :url="network.identicon(address)"
          :badge-bottom="!!network.icon"
          class="shrink-0"
        >
          <template #badge>
            <AppAvatarBadge type="network">
              <img
                :src="network.icon"
                :alt="`Active network: ${network.name}`"
                class="size-full object-contain"
              />
            </AppAvatarBadge>
          </template>
        </AppAvatar>

        <span class="flex min-w-0 flex-col items-start gap-0.5">
          <span
            v-if="isBalanceLoading"
            class="my-0.5 inline-block h-3 w-12 animate-pulse rounded-4 bg-background-default-hover"
          />
          <span v-else class="text-label-sm leading-3.5 text-text-default">
            {{ cryptoAmount }} {{ network.currencyName }}
          </span>
          <span class="flex min-w-0 items-center gap-1">
            <!-- 10/12 per Figma; the type scale has no 10px style. -->
            <span
              class="max-w-[160px] truncate text-[10px] leading-3 text-text-subtle"
              :title="accountInfo.selectedAccount.name"
            >
              {{ accountInfo.selectedAccount.name }}
            </span>
            <span
              v-if="isConnectedDomain"
              aria-label="Connected to current dapp"
              class="size-1.5 shrink-0 rounded-full bg-background-success"
            />
          </span>
        </span>

        <AppIcon
          name="chevron-down"
          variant="filled"
          size="s"
          class="shrink-0 text-icon-default transition-transform"
          :class="{ 'rotate-180': showAccounts }"
        />
      </button>

      <div class="flex h-full items-center">
        <!-- Subnetwork picker -->
        <div
          v-if="network.subNetworks"
          class="relative flex h-11 cursor-pointer items-center rounded-[10px] p-1.5 pr-8 transition-colors duration-300 hover:bg-background-default-hover"
          :class="{ 'bg-background-default-hover': showChains }"
          @click="showChains = !showChains"
        >
          <p class="m-0 text-label-sm font-medium text-text-default">
            {{ currentSubNetwork.name }}
          </p>

          <subnet-list
            :sub-nets="network.subNetworks"
            :selected-id="currentSubNetwork.id"
            :show-chains="showChains"
            v-bind="$attrs"
            @select:subnetwork="setSubNetwork"
          />
          <AppIcon
            name="chevron-down"
            size="xxs"
            class="absolute top-1/2 right-2 -translate-y-1/2 text-icon-subtle"
          />
        </div>

        <notification
          v-if="isCopied"
          :hide="toggleNotification"
          text="Address copied"
          class="absolute top-[52px] right-2 z-[141]"
        />

        <AppTooltip
          v-if="isConnectedDomain"
          text="Disconnect from current dapp"
          placement="bottom"
        >
          <AppBtnIcon
            icon="link-slash"
            label="Disconnect from current dapp"
            @click="disconnectFromDapp"
          />
        </AppTooltip>
        <AppTooltip text="Copy address" placement="bottom">
          <AppBtnIcon icon="copy" label="Copy address" @click="copy(address)" />
        </AppTooltip>
        <AppTooltip text="View on Blockchain Explorer" placement="bottom">
          <AppBtnIcon
            icon="arrow-top-right-on-square"
            label="View on Blockchain Explorer"
            :href="externalLink"
          />
        </AppTooltip>

        <AppTooltip text="Account's QR code" placement="bottom">
          <AppBtnIcon
            icon="qr-code"
            label="Account's QR code"
            @click="$emit('toggle:deposit')"
          />
        </AppTooltip>
        <AppTooltip text="App" placement="bottom">
          <AppBtnIcon
            icon="cog-6-tooth"
            size="m"
            label="Settings"
            class="shrink-0"
            @click="isSettingsOpen = true"
          />
        </AppTooltip>
      </div>
    </div>

    <ModalAccounts
      :network="network"
      :account-info="accountInfo"
      :show-accounts="showAccounts"
      :toggle="toggleAccounts"
      v-bind="$attrs"
    />

    <deposit
      v-if="accountInfo.selectedAccount"
      :account="accountInfo.selectedAccount"
      :show-deposit="showDeposit"
      :network="network"
      @toggle:deposit="$emit('toggle:deposit')"
    />

    <settings-dialog v-model="isSettingsOpen" />
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef, watch, type PropType } from 'vue';
import { useRouter } from 'vue-router';
import AppBtnIcon from '@common/components/buttons/AppBtnIcon.vue';
import AppIcon from '@common/components/icon/AppIcon.vue';
import AppAvatar from '@common/components/avatar/AppAvatar.vue';
import AppAvatarBadge from '@common/components/avatar/AppAvatarBadge.vue';
import useAccountInfo from '@action/composables/account-info';
import AppTooltip from '@common/components/tooltip/AppTooltip.vue';
import ModalAccounts from '@action/modules/accounts/ModalAccounts.vue';
import Deposit from '@action/views/deposit/index.vue';
import Notification from '@action/components/notification/index.vue';
import SettingsDialog from '@action/modules/settings/SettingsDialog.vue';
import SubnetList from './components/subnet-list.vue';
import type { AccountsHeaderData } from '@action/types/account';
import { BaseNetwork, SubNetworkOptions } from '@/types/base-network';
import DomainState from '@/libs/domain-state';
import BtcAccountState from '@/providers/bitcoin/libs/accounts-state';
import EvmAccountState from '@/providers/ethereum/libs/accounts-state';
import KadenaAccountState from '@/providers/kadena/libs/accounts-state';
import SolanaAccountState from '@/providers/solana/libs/accounts-state';
import SubstrateAccountState from '@/providers/polkadot/libs/accounts-state';

const props = defineProps({
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

const emit = defineEmits<{
  (e: 'toggle:deposit'): void;
  (e: 'select:subnetwork', id: string): void;
}>();

const router = useRouter();
const isSettingsOpen = ref(false);

/* Accounts list */
const showAccounts = ref(false);
const toggleAccounts = () => {
  showAccounts.value = !showAccounts.value;
};

const address = computed(() =>
  props.accountInfo.selectedAccount
    ? props.network.displayAddress(props.accountInfo.selectedAccount.address)
    : '',
);

// Selected account's balance; '~' until the balances have loaded.
const { cryptoAmount } = useAccountInfo(
  toRef(props, 'network'),
  toRef(props, 'accountInfo'),
);
const isBalanceLoading = computed(() => cryptoAmount.value === '~');

const externalLink = computed(() =>
  props.network.blockExplorerAddr.replace('[[address]]', address.value),
);

/* Copy address */
const isCopied = ref(false);
const toggleNotification = () => {
  isCopied.value = !isCopied.value;
};
const copy = (value: string) => {
  navigator.clipboard.writeText(value);
  toggleNotification();
};

/* Connected dapp */
const domainState = new DomainState();
const currentDomain = ref('');
const isConnectedDomain = ref(false);
const allAccountStates = [
  new EvmAccountState(),
  new BtcAccountState(),
  new SolanaAccountState(),
  new SubstrateAccountState(),
  new KadenaAccountState(),
];

const checkAndSetConnectedDapp = () => {
  Promise.all(
    allAccountStates.map(as => as.isConnected(currentDomain.value)),
  ).then(responses => {
    if (responses.some(Boolean)) isConnectedDomain.value = true;
  });
};

const disconnectFromDapp = async () => {
  await Promise.all(
    allAccountStates.map(as => as.deleteState(currentDomain.value)),
  );
  isConnectedDomain.value = false;
};

/* Subnetworks */
const showChains = ref(false);
const currentSubNetwork = ref<SubNetworkOptions>({ id: '', name: '' });

const setSubNetwork = async (id: string) => {
  const subnet = props.network.subNetworks!.find(net => net.id === id);
  if (subnet) currentSubNetwork.value = subnet;
  emit('select:subnetwork', id);
  setTimeout(() => {
    showChains.value = false;
  }, 100);
};

const checkAndSetSubNetwork = () => {
  if (!props.network.subNetworks) return;
  domainState.getSelectedSubNetWork().then(id => {
    if (id) {
      const subnet = props.network.subNetworks!.find(net => net.id === id);
      if (subnet) currentSubNetwork.value = subnet;
    } else {
      currentSubNetwork.value = props.network.subNetworks![0];
    }
    setSubNetwork(currentSubNetwork.value.id);
  });
};

watch(() => props.network, checkAndSetSubNetwork);

onMounted(async () => {
  router.beforeEach((to, from, next) => {
    showAccounts.value = false;
    next();
  });

  currentDomain.value = await domainState.getCurrentDomain();
  checkAndSetConnectedDapp();
  checkAndSetSubNetwork();
});
</script>
