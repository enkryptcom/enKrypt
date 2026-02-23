<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
    </template>

    <template #content>
      <!-- Loading Screen -->
      <div v-if="isLoading" class="sign-message__loading">
        <div class="sign-message__loading-spinner"></div>
        <p>Loading message...</p>
      </div>

      <!-- Main Content -->
      <div v-else class="sign-message__main">
        <!-- DApp Request Header -->
        <div class="sign-message__dapp-header">
          <img
            :src="Options.faviconURL"
            class="sign-message__dapp-favicon"
            @error="handleFaviconError"
          />
          <div class="sign-message__dapp-text">
            <span class="sign-message__dapp-label">Signature request from</span>
            <h4 class="sign-message__dapp-domain">{{ Options.domain }}</h4>
          </div>
        </div>

        <hardware-wallet-msg :wallet-type="account.walletType" />

        <!-- Security Notice -->
        <div class="sign-message__security-notice">
          <div class="sign-message__security-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="sign-message__security-text">
            <span class="sign-message__security-title">Personal Sign</span>
            <p class="sign-message__security-desc">
              Only sign if you trust this site. Signing does not cost gas.
            </p>
          </div>
        </div>

        <!-- Signer Account -->
        <div class="sign-message__signer-card">
          <div class="sign-message__signer-label">Signing with</div>
          <div class="sign-message__signer-content">
            <img :src="identicon" class="sign-message__signer-avatar" />
            <div class="sign-message__signer-info">
              <h5>{{ account.name }}</h5>
              <p>{{ $filters.replaceWithEllipsis(account.address, 6, 4) }}</p>
            </div>
          </div>
        </div>

        <!-- Message Content -->
        <div class="sign-message__message-section">
          <div class="sign-message__message-header">
            <span class="sign-message__message-title">Message</span>
            <span class="sign-message__message-type">personal_sign</span>
          </div>
          <div class="sign-message__message-content">
            <p>{{ message }}</p>
          </div>
        </div>
      </div>
    </template>

    <template #button-left>
      <base-button title="Decline" :click="deny" :no-background="true" />
    </template>

    <template #button-right>
      <base-button
        :title="isProcessing ? 'Signing...' : 'Sign'"
        :click="approve"
        :disabled="isProcessing"
      />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import SignLogo from '@action/icons/common/sign-logo.vue';
import BaseButton from '@action/components/base-button/index.vue';
import CommonPopup from '@action/views/common-popup/index.vue';
import { getError } from '@/libs/error';
import { ErrorCodes } from '@/providers/ethereum/types';
import { WindowPromiseHandler } from '@/libs/window-promise';
import { onBeforeMount, ref } from 'vue';
import { hexToBuffer } from '@enkryptcom/utils';
import { hexToUtf8 } from 'web3-utils';
import { DEFAULT_EVM_NETWORK, getNetworkByName } from '@/libs/utils/networks';
import { ProviderRequestOptions } from '@/types/provider';
import { isUtf8 } from '@polkadot/util';
import HardwareWalletMsg from '@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue';
import { EvmNetwork } from '../types/evm-network';
import { EnkryptAccount } from '@enkryptcom/types';
import { MessageSigner } from './libs/signer';
import { getRTLOLTLOSafeString } from '@/libs/utils/unicode-detection';

const windowPromise = WindowPromiseHandler(3);
const network = ref<EvmNetwork>(DEFAULT_EVM_NETWORK);
const account = ref<EnkryptAccount>({
  name: '',
  address: '',
} as EnkryptAccount);
const identicon = ref<string>('');
const Options = ref<ProviderRequestOptions>({
  domain: '',
  faviconURL: '',
  title: '',
  url: '',
  tabId: 0,
});
const isProcessing = ref(false);
const isLoading = ref(true);
const message = ref<string>('');

// Handle favicon load errors
const handleFaviconError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = network.value.icon;
};

onBeforeMount(async () => {
  try {
    const { Request, options } = await windowPromise;
    network.value = (await getNetworkByName(
      Request.value.params![2],
    )) as EvmNetwork;
    account.value = Request.value.params![1] as EnkryptAccount;
    identicon.value = network.value.identicon(account.value.address);
    Options.value = options;
    message.value = isUtf8(Request.value.params![0])
      ? getRTLOLTLOSafeString(hexToUtf8(Request.value.params![0]))
      : Request.value.params![0];
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
});

const approve = async () => {
  if (isProcessing.value) return;
  const { Request, Resolve } = await windowPromise;
  const msg = Request.value.params![0] as `0x{string}`;
  isProcessing.value = true;
  MessageSigner({
    account: account.value,
    network: network.value,
    payload: hexToBuffer(msg),
  })
    .then(Resolve.value)
    .catch(Resolve.value);
};

const deny = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@/providers/ethereum/ui/styles/common-popup.less';

.sign-message {
  // Loading Screen
  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 16px;

    p {
      font-size: 14px;
      color: @secondaryLabel;
      margin: 0;
    }
  }

  &__loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid @gray01;
    border-top-color: @primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  // Main Content
  &__main {
    width: 100%;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // DApp Header
  &__dapp-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: linear-gradient(
      135deg,
      rgba(117, 89, 209, 0.08) 0%,
      rgba(117, 89, 209, 0.03) 100%
    );
    border-radius: 10px;
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 12px;
  }

  &__dapp-favicon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__dapp-text {
    flex: 1;
    min-width: 0;
  }

  &__dapp-label {
    font-size: 11px;
    color: @secondaryLabel;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  &__dapp-domain {
    font-size: 14px;
    font-weight: 600;
    color: @primaryLabel;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // Security Notice
  &__security-notice {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(34, 197, 94, 0.06);
    border: 1px solid rgba(34, 197, 94, 0.15);
    border-radius: 10px;
    margin-bottom: 12px;
  }

  &__security-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__security-text {
    flex: 1;
    min-width: 0;
  }

  &__security-title {
    font-size: 13px;
    font-weight: 600;
    color: #15803d;
    display: block;
    margin-bottom: 2px;
  }

  &__security-desc {
    font-size: 11px;
    color: @secondaryLabel;
    margin: 0;
    line-height: 1.4;
  }

  // Signer Card
  &__signer-card {
    background: @lightBg;
    border: 1px solid @gray01;
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 12px;
  }

  &__signer-label {
    font-size: 10px;
    font-weight: 500;
    color: @secondaryLabel;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
  }

  &__signer-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__signer-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &__signer-info {
    flex: 1;
    min-width: 0;

    h5 {
      font-size: 14px;
      font-weight: 600;
      color: @primaryLabel;
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      font-size: 12px;
      font-family: 'SF Mono', 'Roboto Mono', monospace;
      color: @secondaryLabel;
      margin: 0;
    }
  }

  // Message Section
  &__message-section {
    background: @lightBg;
    border: 1px solid @gray01;
    border-radius: 10px;
    overflow: hidden;
  }

  &__message-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.02);
    border-bottom: 1px solid @gray01;
  }

  &__message-title {
    font-size: 11px;
    font-weight: 600;
    color: @secondaryLabel;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  &__message-type {
    font-size: 10px;
    font-weight: 500;
    color: @primary;
    background: rgba(117, 89, 209, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
    font-family: 'SF Mono', 'Roboto Mono', monospace;
  }

  &__message-content {
    padding: 12px;
    max-height: 200px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: @gray02;
      border-radius: 2px;
    }

    p {
      font-size: 14px;
      line-height: 1.5;
      color: @primaryLabel;
      margin: 0;
      word-break: break-word;
      white-space: pre-wrap;
    }
  }
}

// Override common-popup for this component
.common-popup {
  &__content {
    padding: 0 20px !important;
    max-width: 100% !important;
  }
}
</style>
