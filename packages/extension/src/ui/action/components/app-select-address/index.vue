<template>
  <div class="app-select-address__container">
    <!-- Button -->
    <button class="app-select-address" @click="openDialog">
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
      <div v-else class="app-select-address__no-selection">
        Select From Address
      </div>
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
        <!-- List -->
        <div class="app-select-address__dialog__results">
          <h2>{{ searchedTitle }}</h2>
          <custom-scrollbar
            class="app-select-address__dialog__scroll-area"
            :settings="scrollSettings({ suppressScrollX: true })"
          >
            <address-item
              v-for="(account, index) in displayAccounts"
              :key="index"
              :identicon="props.network?.identicon"
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
import { EnkryptAccount } from '@enkryptcom/types';
import { getAccountsByNetworkName } from '@/libs/utils/accounts';
import { BaseNetwork } from '@/types/base-network';
import WarningIcon from '@/ui/action/icons/common/warning-icon.vue';
import AppDialog from '@/ui/action/components/app-dialog/index.vue';
import scrollSettings from '@/libs/utils/scroll-settings';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import AddressItem from './components/address-item.vue';
const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    required: true,
  },
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
  isLoadingAccounts.value = true;
  displayAccounts.value = await getAccountsByNetworkName(props.network.name);
  isLoadingAccounts.value = false;
};

onMounted(() => {
  loadAccounts();
});
watchEffect(() => {
  if (props.network) {
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
    return props.network?.identicon(selectedAddress.value);
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

const searchedTitle = computed(() => {
  // if (props.hasExternalAccounts) {
  //   return `My ${props.network.name} Accounts`;
  // }
  // return 'Select Address';
  return `My ${props.network.name_long} Accounts`;
});
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
.app-select-address {
  button {
    all: unset;
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
    background: @grey16;
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
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @black06;
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
      padding: 8px;
      margin-top: 8px;
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
      margin: auto;
      width: 100%;
      max-height: 400px !important;
    }
  }
}
</style>
