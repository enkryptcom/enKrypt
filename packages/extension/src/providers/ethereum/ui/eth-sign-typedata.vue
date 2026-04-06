<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
    </template>

    <template #content>
      <!-- Loading Screen -->
      <div v-if="isLoading" class="sign-typedata__loading">
        <div class="sign-typedata__loading-spinner"></div>
        <p>Loading message...</p>
      </div>

      <!-- Main Content -->
      <div v-else class="sign-typedata__main">
        <!-- DApp Request Header -->
        <div class="sign-typedata__dapp-header">
          <img
            :src="Options.faviconURL"
            class="sign-typedata__dapp-favicon"
            @error="handleFaviconError"
          />
          <div class="sign-typedata__dapp-text">
            <span class="sign-typedata__dapp-label"
              >Signature request from</span
            >
            <h4 class="sign-typedata__dapp-domain">{{ Options.domain }}</h4>
          </div>
        </div>

        <hardware-wallet-msg :wallet-type="account.walletType" />

        <!-- Security Notice -->
        <div
          class="sign-typedata__security-notice"
          :class="{ 'is-permit': isPermitSignature }"
        >
          <div class="sign-typedata__security-icon">
            <svg
              v-if="isPermitSignature"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="sign-typedata__security-text">
            <span class="sign-typedata__security-title">
              {{
                isPermitSignature
                  ? 'Token Approval Signature'
                  : 'Signature Request'
              }}
            </span>
            <p class="sign-typedata__security-desc">
              {{
                isPermitSignature
                  ? 'This signature authorizes token spending without a transaction.'
                  : 'Only sign if you trust this site. Signing does not cost gas.'
              }}
            </p>
          </div>
        </div>

        <!-- Signer Account -->
        <div class="sign-typedata__signer-card">
          <div class="sign-typedata__signer-label">Signing with</div>
          <div class="sign-typedata__signer-content">
            <img :src="identicon" class="sign-typedata__signer-avatar" />
            <div class="sign-typedata__signer-info">
              <h5>{{ account.name }}</h5>
              <p>{{ $filters.replaceWithEllipsis(account.address, 6, 4) }}</p>
            </div>
          </div>
        </div>

        <!-- Message Content -->
        <div class="sign-typedata__message-section">
          <div class="sign-typedata__message-header">
            <span class="sign-typedata__message-title">Message Details</span>
            <span class="sign-typedata__message-type">{{
              messageTypeLabel
            }}</span>
          </div>
          <div class="sign-typedata__message-content">
            <JsonTreeView
              v-if="message !== ''"
              :data="message"
              :max-depth="2"
              :root-key-string="'Typed Data'"
            />
            <div v-else class="sign-typedata__message-empty">
              No message data available
            </div>
          </div>
        </div>

        <!-- Permit Details (if applicable) -->
        <div
          v-if="isPermitSignature && permitDetails"
          class="sign-typedata__permit-details"
        >
          <div class="sign-typedata__permit-row">
            <span class="sign-typedata__permit-label">Token</span>
            <span class="sign-typedata__permit-value">{{
              permitDetails.token
            }}</span>
          </div>
          <div class="sign-typedata__permit-row">
            <span class="sign-typedata__permit-label">Spender</span>
            <span class="sign-typedata__permit-value address">{{
              permitDetails.spender
            }}</span>
          </div>
          <div class="sign-typedata__permit-row">
            <span class="sign-typedata__permit-label">Amount</span>
            <span
              class="sign-typedata__permit-value"
              :class="{ unlimited: permitDetails.isUnlimited }"
            >
              {{ permitDetails.amount }}
            </span>
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
import { JsonTreeView } from '@/libs/json-tree-view';
import SignLogo from '@action/icons/common/sign-logo.vue';
import BaseButton from '@action/components/base-button/index.vue';
import CommonPopup from '@action/views/common-popup/index.vue';
import HardwareWalletMsg from '@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue';
import { getError } from '@/libs/error';
import { ErrorCodes } from '@/providers/ethereum/types';
import { WindowPromiseHandler } from '@/libs/window-promise';
import { onMounted, ref, computed } from 'vue';
import { DEFAULT_EVM_NETWORK, getNetworkByName } from '@/libs/utils/networks';
import { ProviderRequestOptions } from '@/types/provider';
import { SignTypedDataVersion } from '@metamask/eth-sig-util';
import { sanitizeData } from '@/providers/ethereum/libs/sanitize-typed-data';
import { EvmNetwork } from '../types/evm-network';
import { EnkryptAccount } from '@enkryptcom/types';
import { TypedMessageSigner } from './libs/signer';

const network = ref<EvmNetwork>(DEFAULT_EVM_NETWORK);
const account = ref<EnkryptAccount>({
  name: '',
  address: '',
} as EnkryptAccount);
const identicon = ref<string>('');
const windowPromise = WindowPromiseHandler(4);
const Options = ref<ProviderRequestOptions>({
  domain: '',
  faviconURL: '',
  title: '',
  url: '',
  tabId: 0,
});
const message = ref<string>('');
const isLoading = ref<boolean>(true);
const isProcessing = ref<boolean>(false);
const parsedTypedData = ref<any>(null);

// Detect if this is a permit signature (EIP-2612)
const isPermitSignature = computed(() => {
  if (!parsedTypedData.value) return false;
  const primaryType = parsedTypedData.value.primaryType?.toLowerCase() || '';
  const types = parsedTypedData.value.types || {};
  return (
    primaryType.includes('permit') ||
    !!types.Permit ||
    !!types.PermitSingle ||
    !!types.PermitBatch
  );
});

// Extract permit details for display
const permitDetails = computed(() => {
  if (!isPermitSignature.value || !parsedTypedData.value) return null;
  const msg = parsedTypedData.value.message || {};
  const domain = parsedTypedData.value.domain || {};

  let amount = msg.value || msg.amount || '';
  let isUnlimited = false;

  // Check for unlimited approval (max uint256)
  if (
    amount ===
      '115792089237316195423570985008687907853269984665640564039457584007913129639935' ||
    amount ===
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff' ||
    BigInt(amount || 0) >=
      BigInt('0xffffffffffffffffffffffffffffffffffffffffffff')
  ) {
    amount = 'Unlimited';
    isUnlimited = true;
  }

  return {
    token: domain.name || 'Unknown Token',
    spender: msg.spender
      ? `${msg.spender.slice(0, 6)}...${msg.spender.slice(-4)}`
      : 'Unknown',
    amount: isUnlimited ? 'Unlimited' : amount,
    isUnlimited,
  };
});

// Message type label for display
const messageTypeLabel = computed(() => {
  if (!parsedTypedData.value) return 'EIP-712';
  const primaryType = parsedTypedData.value.primaryType;
  if (primaryType) return primaryType;
  return 'EIP-712';
});

// Handle favicon load errors
const handleFaviconError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = network.value.icon;
};

onMounted(async () => {
  try {
    const { Request, options } = await windowPromise;
    network.value = (await getNetworkByName(
      Request.value.params![3],
    )) as EvmNetwork;
    account.value = Request.value.params![1] as EnkryptAccount;
    identicon.value = network.value.identicon(account.value.address);
    Options.value = options;

    const version = Request.value.params![2] as SignTypedDataVersion;
    if (version === SignTypedDataVersion.V1) {
      message.value = JSON.stringify(Request.value.params![0]);
    } else {
      let parsedJSON = Request.value.params![0];
      if (typeof parsedJSON === 'string') parsedJSON = JSON.parse(parsedJSON);
      parsedTypedData.value = parsedJSON;
      const sanitized = sanitizeData(parsedJSON, version);
      message.value = JSON.stringify(sanitized);
    }
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
});

const approve = async () => {
  if (isProcessing.value) return;
  isProcessing.value = true;

  try {
    const { Request, Resolve } = await windowPromise;
    const version = Request.value.params![2] as SignTypedDataVersion;
    const typedData = Request.value.params![0];
    TypedMessageSigner({
      account: account.value,
      network: network.value,
      version: version as any,
      typedData,
    })
      .then(Resolve.value)
      .catch(Resolve.value);
  } catch {
    isProcessing.value = false;
  }
};

const deny = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({ error: getError(ErrorCodes.userRejected) });
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@/providers/ethereum/ui/styles/common-popup.less';

.sign-typedata {
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

    &.is-permit {
      background: rgba(245, 158, 11, 0.06);
      border-color: rgba(245, 158, 11, 0.2);

      .sign-typedata__security-icon {
        background: rgba(245, 158, 11, 0.12);
        color: #d97706;
      }

      .sign-typedata__security-title {
        color: #b45309;
      }
    }
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
    margin-bottom: 12px;
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
  }

  &__message-content {
    padding: 8px 12px;
    max-height: 180px;
    overflow-y: auto;
    font-size: 13px;

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
  }

  &__message-empty {
    color: @secondaryLabel;
    font-size: 13px;
    text-align: center;
    padding: 16px;
  }

  // Permit Details
  &__permit-details {
    background: rgba(245, 158, 11, 0.04);
    border: 1px solid rgba(245, 158, 11, 0.12);
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 12px;
  }

  &__permit-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;

    &:not(:last-child) {
      border-bottom: 1px solid rgba(245, 158, 11, 0.08);
    }
  }

  &__permit-label {
    font-size: 12px;
    color: @secondaryLabel;
  }

  &__permit-value {
    font-size: 12px;
    font-weight: 600;
    color: @primaryLabel;

    &.address {
      font-family: 'SF Mono', 'Roboto Mono', monospace;
      font-weight: 500;
    }

    &.unlimited {
      color: #dc2626;
      font-weight: 700;
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
