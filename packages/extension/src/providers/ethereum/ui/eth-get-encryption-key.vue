<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
    </template>

    <template #content>
      <!-- Loading Screen -->
      <div v-if="isLoading" class="encryption-key__loading">
        <div class="encryption-key__loading-spinner"></div>
        <p>Loading...</p>
      </div>

      <!-- Main Content -->
      <div v-else class="encryption-key__main">
        <!-- DApp Request Header -->
        <div class="encryption-key__dapp-header">
          <img
            :src="Options.faviconURL"
            class="encryption-key__dapp-favicon"
            @error="handleFaviconError"
          />
          <div class="encryption-key__dapp-text">
            <span class="encryption-key__dapp-label">Request from</span>
            <h4 class="encryption-key__dapp-domain">{{ Options.domain }}</h4>
          </div>
        </div>

        <!-- Security Notice -->
        <div class="encryption-key__security-notice">
          <div class="encryption-key__security-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="encryption-key__security-text">
            <span class="encryption-key__security-title"
              >Encryption Key Request</span
            >
            <p class="encryption-key__security-desc">
              This site wants your public encryption key. This allows them to
              encrypt messages only you can read.
            </p>
          </div>
        </div>

        <!-- Account Card -->
        <div class="encryption-key__account-card">
          <div class="encryption-key__account-label">Provide key from</div>
          <div class="encryption-key__account-content">
            <img :src="identicon" class="encryption-key__account-avatar" />
            <div class="encryption-key__account-info">
              <h5>{{ account.name }}</h5>
              <p>{{ $filters.replaceWithEllipsis(account.address, 6, 4) }}</p>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="encryption-key__info-box">
          <div class="encryption-key__info-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <p>
            Your public encryption key can be shared safely. It cannot be used
            to access your funds or sign transactions.
          </p>
        </div>
      </div>
    </template>

    <template #button-left>
      <base-button title="Decline" :click="deny" :no-background="true" />
    </template>

    <template #button-right>
      <base-button
        :title="isProcessing ? 'Providing...' : 'Provide'"
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
import { InternalMethods } from '@/types/messenger';
import { onBeforeMount, ref } from 'vue';
import { DEFAULT_EVM_NETWORK, getNetworkByName } from '@/libs/utils/networks';
import { EvmNetwork } from '../types/evm-network';
import { ProviderRequestOptions } from '@/types/provider';
import { EnkryptAccount } from '@enkryptcom/types';

const windowPromise = WindowPromiseHandler(2);
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
const isLoading = ref(true);
const isProcessing = ref(false);

// Handle favicon load errors
const handleFaviconError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = network.value.icon;
};

onBeforeMount(async () => {
  try {
    const { Request, options } = await windowPromise;
    network.value = (await getNetworkByName(
      Request.value.params![1],
    )) as EvmNetwork;
    account.value = Request.value.params![0] as EnkryptAccount;
    identicon.value = network.value.identicon(account.value.address);
    Options.value = options;
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
});

const approve = async () => {
  if (isProcessing.value) return;
  isProcessing.value = true;

  const { sendToBackground, Resolve } = await windowPromise;
  sendToBackground({
    method: InternalMethods.getEthereumEncryptionPublicKey,
    params: [account.value],
  }).then(res => {
    if (res.error) {
      Resolve.value(res);
    } else {
      Resolve.value({
        result: JSON.stringify(res.result),
      });
    }
  });
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

.encryption-key {
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
    font-size: 12px;
    color: @secondaryLabel;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  &__dapp-domain {
    font-size: 15px;
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
    background: rgba(59, 130, 246, 0.06);
    border: 1px solid rgba(59, 130, 246, 0.15);
    border-radius: 10px;
    margin-bottom: 12px;
  }

  &__security-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
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
    font-size: 14px;
    font-weight: 600;
    color: #1d4ed8;
    display: block;
    margin-bottom: 2px;
  }

  &__security-desc {
    font-size: 12px;
    color: @secondaryLabel;
    margin: 0;
    line-height: 1.4;
  }

  // Account Card
  &__account-card {
    background: @lightBg;
    border: 1px solid @gray01;
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 12px;
  }

  &__account-label {
    font-size: 11px;
    font-weight: 500;
    color: @secondaryLabel;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
  }

  &__account-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__account-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &__account-info {
    flex: 1;
    min-width: 0;

    h5 {
      font-size: 15px;
      font-weight: 600;
      color: @primaryLabel;
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      font-size: 13px;
      font-family: 'SF Mono', 'Roboto Mono', monospace;
      color: @secondaryLabel;
      margin: 0;
    }
  }

  // Info Box
  &__info-box {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid @gray01;
    border-radius: 10px;
  }

  &__info-icon {
    color: @secondaryLabel;
    flex-shrink: 0;
    margin-top: 1px;
  }

  &__info-box p {
    font-size: 13px;
    color: @secondaryLabel;
    margin: 0;
    line-height: 1.5;
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
