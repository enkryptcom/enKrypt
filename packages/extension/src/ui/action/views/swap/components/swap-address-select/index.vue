<template>
  <div class="app-select-address__container">
    <!-- Button -->
    <button
      class="app-select-address"
      @click="openDialog"
      :class="{ skeleton: isLoading }"
      :disabled="isLoading"
    >
      <div class="app-select-address__avatar">
        <!-- Selected Identicon -->
        <img
          v-if="displayIdenticon"
          :src="displayIdenticon"
          alt=""
          width="32px"
          height="32px"
        />
      </div>
      <!-- Selected Address -->
      <div v-if="selectedAddress" class="app-select-address__info">
        <div v-if="displaySelectedTitle" class="title">
          {{ displaySelectedTitle }}
        </div>
        <div :class="['subtext', { subtext__warning: !internalAccount }]">
          <span>
            <warning-icon
              v-if="!internalAccount"
              class="app-select-address__warning"
          /></span>

          {{ displaySelectedSubtext }}
        </div>
      </div>
      <div v-else class="app-select-address__no-selection">Loading Address</div>
      <switch-arrow class="app-select-address__arrow" />
    </button>
    <!-- Address Input Dialog-->
    <app-dialog v-model="isOpened">
      <div class="app-select-address__dialog">
        <!-- Header -->
        <div class="app-select-address__dialog__header">
          <h1>{{ titleInbutton }}</h1>
        </div>
        <!-- Search -->
        <div class="app-select-address__dialog__search">
          <div class="app-select-address__avatar">
            <img
              v-if="searchIdenticon"
              :src="searchIdenticon"
              alt=""
              width="32px"
              height="32px"
            />
          </div>

          <input
            type="text"
            v-model="search"
            placeholder="Account name or address"
            class="app-select-address__dialog__search__input"
            @input="checkValidSearchAddress"
          />
        </div>
        <!-- List -->
        <div class="app-select-address__dialog__results">
          <custom-scrollbar
            class="app-select-address__dialog__scroll-area"
            :settings="scrollSettings({ suppressScrollX: true })"
          >
            <h2>{{ myAccountsTitle }}</h2>
            <address-item
              v-for="(account, index) in searchAccounts"
              :key="index"
              :identicon="props.identicon"
              :account="account"
              :address="account.address"
              :selected="selectedAddress"
              @selected:account="setSelectedAddress"
            />
          </custom-scrollbar>
        </div>
      </div>
    </app-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref, watchEffect, onMounted } from 'vue';
import SwitchArrow from '@action/icons/header/switch_arrow.vue';
import { EnkryptAccount, NetworkNames } from '@enkryptcom/types';
import { getAccountsByNetworkName } from '@/libs/utils/accounts';
import WarningIcon from '@/ui/action/icons/common/warning-icon.vue';
import AppDialog from '@/ui/action/components/app-dialog/index.vue';
import scrollSettings from '@/libs/utils/scroll-settings';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import AddressItem from './components/address-item.vue';
import { debounce } from 'lodash';

const props = defineProps({
  titleInbutton: {
    type: String,
    default: 'Select Address',
  },
  title: {
    type: String,
    default: 'Select Address',
  },
  hasExternalAccounts: {
    type: Boolean,
    default: true,
  },
  networkName: {
    type: String as PropType<NetworkNames>,
    required: false,
  },
  identicon: {
    type: Function,
    default: () => '',
  },
  isValidSearchAddress: {
    type: Boolean,
    default: () => false,
  },
  isLoading: {
    type: Boolean,
    default: () => true,
  },
});

/** -------------------
 * Selected Address
 -------------------*/
const selectedAddress = defineModel<string | undefined>('selected-address', {
  default: undefined,
});

const isLoadingAccounts = ref<boolean>(true);
const displayAccounts = ref<EnkryptAccount[]>([]);

const loadAccounts = async () => {
  if (props.networkName) {
    isLoadingAccounts.value = true;
    displayAccounts.value = await getAccountsByNetworkName(props.networkName);
    isLoadingAccounts.value = false;
  }
};

onMounted(() => {
  loadAccounts();
});
watchEffect(() => {
  if (props.networkName) {
    loadAccounts();
  }
});

const getFormattedAddress = (address: string) => {
  const firstPart = address.slice(0, 6);
  const lastPart = address.slice(-4);
  return `${firstPart}...${lastPart}`;
};

const internalAccount = computed(() => {
  if (selectedAddress.value) {
    const account = displayAccounts.value.find(
      account => account.address === selectedAddress.value,
    );
    if (account) {
      return account;
    }
  }
  return undefined;
});
const displaySelectedTitle = computed<string | undefined>(() => {
  if (selectedAddress.value) {
    const account = internalAccount.value;
    if (account) {
      return account.name;
    }
    return getFormattedAddress(selectedAddress.value);
  }
  return undefined;
});
const displaySelectedSubtext = computed<string | undefined>(() => {
  if (selectedAddress.value) {
    const account = internalAccount.value;
    if (account) {
      return getFormattedAddress(selectedAddress.value);
    }
    return 'External account';
  }
  return undefined;
});
const displayIdenticon = computed(() => {
  if (selectedAddress.value) {
    return props.identicon(selectedAddress.value);
  }
  return undefined;
});

const setSelectedAddress = (address: string) => {
  selectedAddress.value = address;
  isOpened.value = false;
};
/** -------------------
 * Dialog
 -------------------*/
const isOpened = ref<boolean>(false);
const openDialog = () => {
  isOpened.value = true;
};

const myAccountsTitle = computed(() => {
  // if (props.hasExternalAccounts) {
  //   return `My ${props.network.name} Accounts`;
  // }
  // return 'Select Address';
  return `My ${props.networkName} Accounts`;
});
/** -------------------
 * Search
 -------------------*/
const search = ref<string>('');
const emit = defineEmits<{
  (e: 'update:search', search: string): void;
}>();

const searchIdenticon = computed(() => {
  if (search.value && props.isValidSearchAddress) {
    return props.identicon(search.value);
  }
  return undefined;
});

const searchAccounts = computed(() => {
  if (search.value) {
    return displayAccounts.value.filter(
      account =>
        account.name.toLowerCase().includes(search.value.toLowerCase()) ||
        account.address.toLowerCase().includes(search.value.toLowerCase()),
    );
  }
  return displayAccounts.value;
});
const checkValidSearchAddress = debounce(() => {
  emit('update:search', search.value);
}, 200);
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
.app-select-address {
  &:focus-visible {
    outline: none !important;
    border-color: @primary;
  }
  &__container {
    display: flex;
    width: 100%;
  }
  width: 100%;
  background: @white;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid @grey08;
  height: 52px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  cursor: pointer;
  text-decoration: none;
  transition: background 300ms ease-in-out;
  text-overflow: ellipsis;
  overflow: hidden;
  &:hover {
    background: @black007;
  }

  &__avatar {
    flex-basis: auto;
    background: @white;
    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
    min-width: 32px;
    height: 32px;
    border-radius: 100%;
    overflow: hidden;
    object-fit: contain;
  }
  &__info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    text-align: left;
    padding-left: 8px;

    .title {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @black;
      span {
        font-variant: small-caps;
      }
    }
    .subtext {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @black06;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      &__warning {
        margin-left: -4px;
      }
    }
  }
  &__no-selection {
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @black06;
    letter-spacing: 0.25px;
    margin: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    margin-left: 8px;
  }
  &__arrow {
    margin-left: auto;
    min-width: 24px;
  }
  &__warning {
    width: 12px;
    height: 12px;
    display: inline;
    vertical-align: middle;
    z-index: 1;
  }
  &__dialog {
    height: 568px;
    &__header {
      padding: 14px 56px 14px 16px;
      h1 {
        font-style: normal;
        font-weight: 700;
        font-size: 20px;
        line-height: 28px;
        color: @primaryLabel;
        margin: 0;
      }
    }
    &__results {
      border-top: 1px solid @gray02;
      padding: 0 8px;
      h2 {
        font-family: Roboto;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        margin-left: 8px;
      }
    }
    &__scroll-area {
      position: relative;
      width: 100%;
      max-height: 400px !important;
      margin: 0 0 8px 0;
      padding: 0 !important;
      &.ps--active-y {
        padding-right: 0;
      }
    }
    .ps__rail-y {
      right: 0px !important;
    }

    &__search {
      display: flex;
      align-items: center;
      min-height: 56px;
      padding: 0px 16px;
      gap: 8px;

      input {
        width: 100%;
        height: 40px;
        border-radius: 10px;
        border: 0px;
        padding: 4px;
        border: 0 none;
        outline: none;
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
      }
    }
  }
}
</style>
