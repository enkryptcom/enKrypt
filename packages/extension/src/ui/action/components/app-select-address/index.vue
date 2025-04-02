<template>
  <div class="app-select-address__container">
    <a class="app-select-address" @click="openDialog">
      <div class="app-select-address__avatar">
        <img
          v-if="displayIdenticon"
          :src="displayIdenticon"
          alt=""
          width="32px"
          height="32px"
        />
      </div>
      <div class="app-select-address__info">
        <div v-if="displaySelectedTitle" class="title">
          {{ displaySelectedTitle }}
        </div>
        <div v-if="selectedAddress" class="subtext">
          <span>
            <warning-icon
              v-if="!internalAccount"
              class="app-select-address__warning"
          /></span>

          {{ displaySelectedSubtext }}
        </div>
      </div>
      <switch-arrow class="app-select-address__arrow" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref, watchEffect, onMounted } from 'vue';
import SwitchArrow from '@action/icons/header/switch_arrow.vue';
import { EnkryptAccount, NetworkNames } from '@enkryptcom/types';
import { getAccountsByNetworkName } from '@/libs/utils/accounts';
import { BaseNetwork } from '@/types/base-network';
import WarningIcon from '@/ui/action/icons/common/warning-icon.vue';
const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    required: true,
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
  console.log(props.network);
  displayAccounts.value = await getAccountsByNetworkName(props.network.name);
  console.log('displayAccounts', displayAccounts.value);
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

/** -------------------
 * Dialog
 -------------------*/
const isOpened = ref<boolean>(false);
const openDialog = () => {
  isOpened.value = true;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
.app-select-address {
  &__container {
  }
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
  // position: relative;
  text-overflow: ellipsis;
  overflow: hidden;
  // white-space: nowrap;
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
    margin-left: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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
    }
  }
  &__arrow {
    margin-left: auto;
  }
  &__warning {
    width: 12px;
    height: 12px;
    display: inline;
    vertical-align: middle;
  }
}
</style>
