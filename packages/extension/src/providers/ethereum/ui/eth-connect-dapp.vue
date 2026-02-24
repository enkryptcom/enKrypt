<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
      <div class="common-popup__network">
        <img :src="network.icon" />
        <p>{{ network.name_long }}</p>
      </div>
    </template>

    <template #content>
      <div class="provider-connect-dapp__content-wrap">
        <div class="provider-connect-dapp__titles">
          <h2 class="provider-connect-dapp__main-title">Connect your wallet</h2>
          <p class="provider-connect-dapp__sub-title">
            This site is requesting access to your wallet
          </p>
        </div>

        <div class="provider-connect-dapp__connection-viz">
          <div class="provider-connect-dapp__card">
            <div class="provider-connect-dapp__card-icon">
              <img :src="Options.faviconURL" />
            </div>
            <div class="provider-connect-dapp__card-info">
              <h4>{{ Options.title || Options.domain }}</h4>
              <p>{{ Options.domain }}</p>
            </div>
          </div>

          <div class="provider-connect-dapp__link-container">
            <link-icon />
          </div>

          <div class="provider-connect-dapp__card account-card">
            <select-account-input
              :name="accountHeaderData.selectedAccount?.name"
              :address="displayAddress"
              :identicon="identicon"
              @toggle:select-accounts="toggleAccounts"
            />
          </div>
        </div>

        <div
          class="provider-connect-dapp__permissions"
          :class="{ restricted: isRestricted }"
        >
          <div class="provider-connect-dapp__permissions-header">
            <info-icon-gray />
            <span>Permissions requested</span>
          </div>
          <div
            v-if="!isRestricted"
            class="provider-connect-dapp__permissions-list"
          >
            <p>• View your wallet address and balance</p>
            <p>• View your past activity and transactions</p>
          </div>
          <div v-else class="provider-connect-dapp__permissions-error">
            <p>
              Your wallet address is restricted. Please contact
              <a href="mailto:support@myetherwallet.com"
                >support@myetherwallet.com</a
              >
              for assistance.
            </p>
          </div>
        </div>
      </div>

      <modal-accounts
        :show-accounts="showAccounts"
        :close="toggleAccounts"
        :network="network"
        :account-info="accountHeaderData"
        @address-changed="onSelectedAddressChanged"
      />
    </template>

    <template #button-left>
      <base-button title="Decline" :click="decline" :no-background="true" />
    </template>

    <template #button-right>
      <base-button :disabled="isRestricted" title="Connect" :click="connect" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import SignLogo from '@action/icons/common/sign-logo.vue';
import BaseButton from '@action/components/base-button/index.vue';
import commonPopup from '@action/views/common-popup/index.vue';
import LinkIcon from '@action/icons/connect/link-icon.vue';
import InfoIconGray from '@action/icons/common/info-icon-gray.vue';
import SelectAccountInput from '@action/components/select-account-input/index.vue';
import ModalAccounts from '@action/views/modal-accounts/index.vue';
import { AccountsHeaderData } from '@action/types/account';
import { EnkryptAccount } from '@enkryptcom/types';
import { getNetworkByName, DEFAULT_EVM_NETWORK } from '@/libs/utils/networks';
import { WindowPromiseHandler } from '@/libs/window-promise';
import { EvmNetwork } from '../types/evm-network';
import { ProviderRequestOptions } from '@/types/provider';
import PublicKeyRing from '@/libs/keyring/public-keyring';
import { fromBase } from '@enkryptcom/utils';
import { getError } from '@/libs/error';
import { ErrorCodes } from '../types';
import AccountState from '../libs/accounts-state';
import { isWalletRestricted } from '@/libs/utils/screening';

const windowPromise = WindowPromiseHandler(1);
const network = ref<EvmNetwork>(DEFAULT_EVM_NETWORK);
const identicon = ref<string>('');
const displayAddress = ref<string>('');
const isRestricted = ref(false);
const accountHeaderData = ref<AccountsHeaderData>({
  activeAccounts: [],
  inactiveAccounts: [],
  selectedAccount: {
    name: '',
    address: '',
  } as EnkryptAccount,
  activeBalances: [],
});

const Options = ref<ProviderRequestOptions>({
  domain: '',
  faviconURL: '',
  title: '',
  url: '',
  tabId: 0,
});

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  network.value = (await getNetworkByName(
    Request.value.params![0],
  )) as EvmNetwork;
  const keyring = new PublicKeyRing();
  Options.value = options;
  const accounts = await keyring.getAccounts(network.value.signer);
  displayAddress.value = network.value.displayAddress(accounts[0].address);
  identicon.value = network.value.identicon(accounts[0].address);
  accountHeaderData.value = {
    activeAccounts: accounts,
    selectedAccount: accounts[0],
    activeBalances: accounts.map(() => '~'),
    inactiveAccounts: [],
  };
  isWalletRestricted(displayAddress.value).then(res => {
    isRestricted.value = res;
  });
  try {
    const api = await network.value.api();
    const activeBalancePromises = accountHeaderData.value.activeAccounts.map(
      acc => api.getBalance(acc.address),
    );
    Promise.all(activeBalancePromises).then(balances => {
      accountHeaderData.value.activeBalances = balances.map(bal =>
        fromBase(bal, network.value.decimals),
      );
    });
  } catch (e) {
    console.error(e);
  }
});

const showAccounts = ref(false);

const decline = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};

const connect = async () => {
  const { Resolve } = await windowPromise;
  const accountState = new AccountState();
  await accountState.addApprovedAddress(
    accountHeaderData.value.selectedAccount!.address,
    Options.value.domain,
  );
  Resolve.value({
    result: JSON.stringify([accountHeaderData.value.selectedAccount!.address]),
  });
};

const toggleAccounts = () => {
  showAccounts.value = !showAccounts.value;
};

const onSelectedAddressChanged = async (newAccount: EnkryptAccount) => {
  accountHeaderData.value.selectedAccount = newAccount;
  displayAddress.value = network.value.displayAddress(newAccount.address);
  isWalletRestricted(displayAddress.value).then(res => {
    isRestricted.value = res;
  });
  identicon.value = network.value.identicon(newAccount.address);
};
</script>

<style lang="less">
@import '@/providers/ethereum/ui/styles/common-popup.less';
@import '@action/styles/provider-connect-dapp.less';

.provider-connect-dapp {
  &__content-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  &__titles {
    text-align: center;
    margin-bottom: 20px;
  }

  &__main-title {
    font-style: normal;
    font-weight: 700;
    font-size: 22px;
    line-height: 28px;
    letter-spacing: -0.01em;
    color: @primaryLabel;
    margin: 0 0 4px 0;
  }

  &__sub-title {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: @secondaryLabel;
    margin: 0;
  }

  &__connection-viz {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-bottom: 20px;
  }

  &__card {
    background: @white;
    border: 1px solid @gray01;
    border-radius: 12px;
    padding: 12px;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      border-color: @gray02;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    &-icon {
      width: 40px;
      height: 40px;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: @lightBg;
      border-radius: 10px;
      overflow: hidden;

      img {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }
    }

    &-info {
      flex: 1;
      min-width: 0;

      h4 {
        font-weight: 600;
        font-size: 14px;
        line-height: 20px;
        color: @primaryLabel;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      p {
        font-size: 12px;
        line-height: 16px;
        color: @secondaryLabel;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    &.account-card {
      padding: 0;
      overflow: hidden;

      .select-account-input {
        padding: 12px;
        height: auto;

        &__info {
          img {
            width: 40px;
            height: 40px;
            margin-right: 12px;
          }

          &-name {
            p {
              font-weight: 600;
              font-size: 14px;
              line-height: 20px;
            }
            span {
              font-size: 12px;
              line-height: 16px;
            }
          }
        }
      }
    }
  }

  &__link-container {
    width: 100%;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__permissions {
    width: 100%;
    background: @lightBg;
    border-radius: 12px;
    padding: 16px;
    box-sizing: border-box;

    &-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;

      span {
        font-weight: 600;
        font-size: 12px;
        line-height: 16px;
        color: @primaryLabel;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      svg {
        width: 16px;
        height: 16px;
      }
    }

    &-list {
      p {
        font-size: 12px;
        line-height: 18px;
        color: @secondaryLabel;
        margin: 2px 0;
      }
    }

    &-error {
      p {
        font-size: 12px;
        line-height: 18px;
        color: @error;
        margin: 0;

        a {
          color: @error;
          text-decoration: underline;
        }
      }
    }

    &.restricted {
      background: @error01;
      border: 1px solid @error;
    }
  }
}

.common-popup {
  padding: 0 !important;

  &__header {
    padding: 16px 20px !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  &__content {
    max-width: 100% !important;
  }

  &__logo {
    width: 80px !important;
    height: auto !important;
  }

  &__network {
    position: static !important;
    display: flex !important;
    align-items: center !important;

    img {
      width: 20px !important;
      height: 20px !important;
      margin-right: 8px !important;
    }

    p {
      font-size: 12px !important;
      line-height: 16px !important;
      font-weight: 600 !important;
    }
  }

  &__buttons {
    padding: 16px 20px !important;
    gap: 12px !important;
    background: @white !important;
    border-top: 1px solid @gray01 !important;

    &-cancel,
    &-send {
      width: auto !important;
      flex: 1 !important;
    }

    .button {
      height: 40px !important;
      line-height: 40px !important;
      border-radius: 10px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
    }
  }
}
</style>
