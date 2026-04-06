<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
    </template>

    <template #content>
      <!-- Loading Screen -->
      <div v-if="isLoading" class="decrypt-msg__loading">
        <div class="decrypt-msg__loading-spinner"></div>
        <p>Loading...</p>
      </div>

      <!-- Main Content -->
      <div v-else class="decrypt-msg__main">
        <!-- DApp Request Header -->
        <div class="decrypt-msg__dapp-header">
          <img
            :src="Options.faviconURL"
            class="decrypt-msg__dapp-favicon"
            @error="handleFaviconError"
          />
          <div class="decrypt-msg__dapp-text">
            <span class="decrypt-msg__dapp-label">Request from</span>
            <h4 class="decrypt-msg__dapp-domain">{{ Options.domain }}</h4>
          </div>
        </div>

        <!-- Security Notice -->
        <div class="decrypt-msg__security-notice">
          <div class="decrypt-msg__security-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="decrypt-msg__security-text">
            <span class="decrypt-msg__security-title">Decrypt Message</span>
            <p class="decrypt-msg__security-desc">
              This site wants to decrypt a message that was encrypted for your
              account.
            </p>
          </div>
        </div>

        <!-- Account Card -->
        <div class="decrypt-msg__account-card">
          <div class="decrypt-msg__account-label">Decrypt with</div>
          <div class="decrypt-msg__account-content">
            <img :src="identicon" class="decrypt-msg__account-avatar" />
            <div class="decrypt-msg__account-info">
              <h5>{{ account.name }}</h5>
              <p>{{ $filters.replaceWithEllipsis(account.address, 6, 4) }}</p>
            </div>
          </div>
        </div>

        <!-- Warning Box -->
        <div class="decrypt-msg__warning-box">
          <div class="decrypt-msg__warning-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <p>
            Only decrypt if you trust this site. The decrypted content will be
            shared with <strong>{{ Options.domain }}</strong
            >.
          </p>
        </div>
      </div>
    </template>

    <template #button-left>
      <base-button title="Decline" :click="deny" :no-background="true" />
    </template>

    <template #button-right>
      <base-button
        :title="isProcessing ? 'Decrypting...' : 'Decrypt'"
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
import { EnkryptAccount } from '@enkryptcom/types';
import { getError } from '@/libs/error';
import { ErrorCodes } from '@/providers/ethereum/types';
import { WindowPromiseHandler } from '@/libs/window-promise';
import { InternalMethods } from '@/types/messenger';
import { onBeforeMount, ref } from 'vue';
import { DEFAULT_EVM_NETWORK, getNetworkByName } from '@/libs/utils/networks';
import { ProviderRequestOptions } from '@/types/provider';
import { EvmNetwork } from '../types/evm-network';

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
      Request.value.params![2],
    )) as EvmNetwork;
    account.value = Request.value.params![1] as EnkryptAccount;
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

  const { Request, sendToBackground, Resolve } = await windowPromise;
  const encryptedMessage = Request.value.params![0] as string;
  sendToBackground({
    method: InternalMethods.ethereumDecrypt,
    params: [encryptedMessage, account.value],
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

.decrypt-msg {
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
    background: rgba(139, 92, 246, 0.06);
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 10px;
    margin-bottom: 12px;
  }

  &__security-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(139, 92, 246, 0.1);
    color: #7c3aed;
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
    color: #6d28d9;
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

  // Warning Box
  &__warning-box {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    background: rgba(245, 158, 11, 0.06);
    border: 1px solid rgba(245, 158, 11, 0.15);
    border-radius: 10px;
  }

  &__warning-icon {
    color: #d97706;
    flex-shrink: 0;
    margin-top: 1px;
  }

  &__warning-box p {
    font-size: 13px;
    color: @secondaryLabel;
    margin: 0;
    line-height: 1.5;

    strong {
      color: @primaryLabel;
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
