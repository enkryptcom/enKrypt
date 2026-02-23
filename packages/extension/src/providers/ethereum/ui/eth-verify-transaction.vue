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
      <!-- Loading Screen -->
      <div v-if="isLoading" class="provider-verify-transaction__loading">
        <div class="provider-verify-transaction__loading-spinner"></div>
        <p>Loading transaction...</p>
      </div>

      <!-- Main Content -->
      <div v-else class="provider-verify-transaction__main">
        <!-- DApp Request Header -->
        <div class="provider-verify-transaction__dapp-header">
          <img
            :src="Options.faviconURL"
            class="provider-verify-transaction__dapp-favicon"
          />
          <div class="provider-verify-transaction__dapp-text">
            <span class="provider-verify-transaction__dapp-label"
              >Request from</span
            >
            <h4 class="provider-verify-transaction__dapp-domain">
              {{ Options.domain }}
            </h4>
          </div>
        </div>

        <hardware-wallet-msg :wallet-type="account.walletType" />

        <!-- Amount Card -->
        <div
          class="provider-verify-transaction__amount-card"
          v-if="!isApproval && decodedTx"
        >
          <div class="provider-verify-transaction__amount-label">
            You're sending
          </div>
          <div class="provider-verify-transaction__amount-main">
            <div class="provider-verify-transaction__amount-token">
              <img :src="decodedTx?.tokenImage || network.icon" />
            </div>
            <div class="provider-verify-transaction__amount-info">
              <div class="provider-verify-transaction__amount-value">
                {{
                  $filters.formatFloatingPointValue(
                    fromBase(
                      decodedTx?.tokenValue || '0x0',
                      decodedTx?.tokenDecimals || 18,
                    ),
                  ).value
                }}
                <span>{{
                  decodedTx?.tokenSymbol || network.currencyName
                }}</span>
              </div>
              <div class="provider-verify-transaction__amount-fiat">
                {{
                  fiatValue !== '~'
                    ? $filters.parseCurrency(fiatValue)
                    : fiatValue
                }}
              </div>
            </div>
          </div>
        </div>

        <!-- Approval Notice -->
        <div
          v-if="isApproval"
          class="provider-verify-transaction__approval-notice"
        >
          <div class="provider-verify-transaction__approval-badge">
            <span>Approval</span>
          </div>
          <p>
            Allow <strong>{{ Options.domain }}</strong> to spend
            <span class="provider-verify-transaction__approval-amount">{{
              approvalAmount
            }}</span>
            {{ decodedTx?.tokenName || network.currencyName }}
          </p>
        </div>

        <!-- Transaction Flow -->
        <div class="provider-verify-transaction__flow">
          <!-- From -->
          <div class="provider-verify-transaction__flow-card">
            <div class="provider-verify-transaction__flow-indicator from">
              <span>FROM</span>
            </div>
            <div class="provider-verify-transaction__flow-content">
              <img
                :src="identicon"
                class="provider-verify-transaction__flow-avatar"
              />
              <div class="provider-verify-transaction__flow-details">
                <h5>{{ account.name }}</h5>
                <p>{{ $filters.replaceWithEllipsis(account.address, 6, 4) }}</p>
              </div>
              <div class="provider-verify-transaction__flow-balance">
                <span>{{
                  TokenBalance == '~'
                    ? '~'
                    : $filters.formatFloatingPointValue(TokenBalance).value
                }}</span>
                <small>{{ network.currencyName }}</small>
              </div>
            </div>
          </div>

          <!-- Arrow -->
          <div class="provider-verify-transaction__flow-arrow">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3L8 13M8 13L12 9M8 13L4 9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <!-- To -->
          <div class="provider-verify-transaction__flow-card">
            <div class="provider-verify-transaction__flow-indicator to">
              <span>TO</span>
            </div>
            <div class="provider-verify-transaction__flow-content">
              <img
                :src="identiconTo"
                class="provider-verify-transaction__flow-avatar"
              />
              <div class="provider-verify-transaction__flow-details full">
                <p class="provider-verify-transaction__flow-address">
                  {{
                    decodedTx?.tokenTo || decodedTx?.toAddress
                      ? network.displayAddress(
                          (decodedTx?.tokenTo ||
                            decodedTx?.toAddress) as string,
                        )
                      : '~'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Fee Section -->
        <div class="provider-verify-transaction__fee-card">
          <send-fee-select
            :in-swap="true"
            :selected="selectedFee"
            :fee="gasCostValues[selectedFee]"
            @open-popup="toggleSelectFee"
          />
        </div>

        <!-- Data Toggle -->
        <button
          class="provider-verify-transaction__data-btn"
          :class="{ open: isOpenData }"
          @click="toggleData"
        >
          <span>{{ isOpenData ? 'Hide' : 'View' }} transaction data</span>
          <right-chevron :class="{ rotated: isOpenData }" />
        </button>

        <div v-show="isOpenData" class="provider-verify-transaction__data-box">
          <code>{{ decodedTx?.dataHex || '0x' }}</code>
        </div>

        <div v-if="errorMsg != ''" class="provider-verify-transaction__error">
          <alert-icon />
          <p>{{ errorMsg }}</p>
        </div>
      </div>

      <transaction-fee-view
        v-model="isOpenSelectFee"
        :fees="gasCostValues"
        :selected="selectedFee"
        :is-header="true"
        is-popup
        @gas-type-changed="selectFee"
      />
    </template>

    <template #button-left>
      <base-button
        title="Decline"
        :click="deny"
        :no-background="true"
        :disabled="isProcessing"
      />
    </template>

    <template #button-right>
      <base-button
        title="Send"
        :click="approve"
        :disabled="isProcessing || errorMsg != ''"
      />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { ref, ComponentPublicInstance, onBeforeMount } from 'vue';
import SignLogo from '@action/icons/common/sign-logo.vue';
import RightChevron from '@action/icons/common/right-chevron.vue';
import BaseButton from '@action/components/base-button/index.vue';
import CommonPopup from '@action/views/common-popup/index.vue';
import SendFeeSelect from '@/providers/common/ui/send-transaction/send-fee-select.vue';
import HardwareWalletMsg from '@/providers/common/ui/verify-transaction/hardware-wallet-msg.vue';
import TransactionFeeView from '@action/views/transaction-fee/index.vue';
import { getCustomError, getError } from '@/libs/error';
import { ErrorCodes } from '@/providers/ethereum/types';
import { WindowPromiseHandler } from '@/libs/window-promise';
import { DEFAULT_EVM_NETWORK, getNetworkByName } from '@/libs/utils/networks';
import { DecodedTx, EthereumTransaction } from '../libs/transaction/types';
import Transaction from '@/providers/ethereum/libs/transaction';
import Web3Eth from 'web3-eth';
import { EvmNetwork } from '../types/evm-network';
import { decodeTx } from '../libs/transaction/decoder';
import { ProviderRequestOptions } from '@/types/provider';
import BigNumber from 'bignumber.js';
import { GasFeeType, GasPriceTypes } from '@/providers/common/types';
import MarketData from '@/libs/market-data';
import { defaultGasCostVals } from '@/providers/common/libs/default-vals';
import { EnkryptAccount } from '@enkryptcom/types';
import { TransactionSigner } from './libs/signer';
import { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import { generateAddress, bigIntToBytes } from '@ethereumjs/util';
import ActivityState from '@/libs/activity-state';
import { bigIntToHex, fromBase, bufferToHex } from '@enkryptcom/utils';
import broadcastTx from '../libs/tx-broadcaster';
import TokenSigs from '../libs/transaction/lists/tokenSigs';
import AlertIcon from '@action/icons/send/alert-icon.vue';
import { NetworkNames } from '@enkryptcom/types';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';

const isProcessing = ref(false);
const isLoading = ref(true);
const isOpenSelectFee = ref(false);
const providerVerifyTransactionScrollRef = ref<ComponentPublicInstance>();
const isOpenData = ref(false);
const TokenBalance = ref<string>('~');
const fiatValue = ref<string>('~');
const decodedTx = ref<DecodedTx>();
const isApproval = ref(false);
const approvalAmount = ref('');
const network = ref<EvmNetwork>(DEFAULT_EVM_NETWORK);
const marketdata = new MarketData();
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const errorMsg = ref('');
const account = ref<EnkryptAccount>({
  name: '',
  address: '',
} as EnkryptAccount);
const identicon = ref<string>('');
const identiconTo = ref<string>(network.value.identicon(''));
const windowPromise = WindowPromiseHandler(3);
const Options = ref<ProviderRequestOptions>({
  domain: '',
  faviconURL: '',
  title: '',
  url: '',
  tabId: 0,
});
const selectedFee = ref<GasPriceTypes>(GasPriceTypes.ECONOMY);

defineExpose({ providerVerifyTransactionScrollRef });

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  network.value = (await getNetworkByName(
    Request.value.params![2],
  )) as EvmNetwork;
  selectedFee.value =
    network.value.name === NetworkNames.Ethereum || NetworkNames.Binance
      ? GasPriceTypes.REGULAR
      : GasPriceTypes.ECONOMY;
  account.value = Request.value.params![1] as EnkryptAccount;
  identicon.value = network.value.identicon(account.value.address);
  Options.value = options;
  if (network.value.api) {
    const api = await network.value.api();
    const balance = await api.getBalance(account.value.address);
    TokenBalance.value = fromBase(balance, network.value.decimals);
  }
  await decodeTx(
    Request.value.params![0] as EthereumTransaction,
    network.value as EvmNetwork,
  ).then(decoded => {
    const realToAddress = decoded.tokenTo || decoded.toAddress || '';
    identiconTo.value = network.value.identicon(realToAddress!.toLowerCase());
    if (decoded.decoded && decoded.dataHex.startsWith(TokenSigs.approve)) {
      isApproval.value = true;
      if (
        decoded.decodedHex![1] ===
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      ) {
        approvalAmount.value = 'any amount';
      } else {
        approvalAmount.value = fromBase(
          decoded.decodedHex![1],
          decoded.tokenDecimals,
        );
      }
    }
    decodedTx.value = decoded;
    fiatValue.value = new BigNumber(
      fromBase(decoded.tokenValue, decoded.tokenDecimals),
    )
      .times(decoded.currentPriceUSD)
      .toFixed(2);
  });
  const web3 = new Web3Eth(network.value.node);
  const tx = new Transaction(
    Request.value.params![0] as EthereumTransaction,
    web3,
  );
  await tx
    .getGasCosts()
    .then(async gasvals => {
      let nativeVal = '0';
      if (network.value.coingeckoID) {
        await marketdata
          .getTokenValue('1', network.value.coingeckoID, 'USD')
          .then(val => (nativeVal = val));
      }
      const getConvertedVal = (type: GasPriceTypes) =>
        fromBase(gasvals[type], network.value.decimals);

      gasCostValues.value = {
        [GasPriceTypes.ECONOMY]: {
          nativeValue: getConvertedVal(GasPriceTypes.ECONOMY),
          fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.ECONOMY))
            .times(nativeVal)
            .toString(),
          nativeSymbol: network.value.currencyName,
          fiatSymbol: 'USD',
        },
        [GasPriceTypes.REGULAR]: {
          nativeValue: getConvertedVal(GasPriceTypes.REGULAR),
          fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.REGULAR))
            .times(nativeVal)
            .toString(),
          nativeSymbol: network.value.currencyName,
          fiatSymbol: 'USD',
        },
        [GasPriceTypes.FAST]: {
          nativeValue: getConvertedVal(GasPriceTypes.FAST),
          fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FAST))
            .times(nativeVal)
            .toString(),
          nativeSymbol: network.value.currencyName,
          fiatSymbol: 'USD',
        },
        [GasPriceTypes.FASTEST]: {
          nativeValue: getConvertedVal(GasPriceTypes.FASTEST),
          fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FASTEST))
            .times(nativeVal)
            .toString(),
          nativeSymbol: network.value.currencyName,
          fiatSymbol: 'USD',
        },
      };
      selectedFee.value = GasPriceTypes.REGULAR;
    })
    .catch(e => {
      errorMsg.value = e.message;
    })
    .finally(() => {
      isLoading.value = false;
    });
});

const approve = async () => {
  isProcessing.value = true;
  trackSendEvents(SendEventType.SendAPIApprove, {
    network: network.value.name,
  });
  const { Request, Resolve } = await windowPromise;
  const web3 = new Web3Eth(network.value.node);
  const tx = new Transaction(
    Request.value.params![0] as EthereumTransaction,
    web3,
  );
  tx.getFinalizedTransaction({ gasPriceType: selectedFee.value }).then(
    finalizedTx => {
      const activityState = new ActivityState();
      TransactionSigner({
        account: account.value,
        network: network.value,
        payload: finalizedTx,
      })
        .then(tx => {
          const txActivity: Activity = {
            from: account.value.address,
            to: tx.to
              ? tx.to.toString()
              : bufferToHex(
                  generateAddress(
                    tx.getSenderAddress().toBytes(),
                    bigIntToBytes(tx.nonce),
                  ),
                ),
            isIncoming: tx.getSenderAddress().toString() === tx.to?.toString(),
            network: network.value.name,
            status: ActivityStatus.pending,
            timestamp: new Date().getTime(),
            token: {
              decimals: decodedTx.value?.tokenDecimals || 18,
              icon: decodedTx.value?.tokenImage || '',
              name: decodedTx.value?.tokenName || 'Unknown',
              symbol: decodedTx.value?.tokenSymbol || 'UKNWN',
              price: decodedTx.value?.currentPriceUSD.toString() || '0',
            },
            type: ActivityType.transaction,
            value: decodedTx.value?.tokenValue || '0x0',
            transactionHash: '',
          };
          const onHash = (hash: string) => {
            trackSendEvents(SendEventType.SendAPIComplete, {
              network: network.value.name,
            });
            activityState
              .addActivities(
                [
                  {
                    ...txActivity,
                    ...{
                      transactionHash: hash,
                      nonce: bigIntToHex(finalizedTx.nonce),
                    },
                  },
                ],
                {
                  address: txActivity.from,
                  network: network.value.name,
                },
              )
              .then(() => {
                Resolve.value({
                  result: JSON.stringify(hash),
                });
              });
          };
          broadcastTx(bufferToHex(tx.serialize()), network.value.name)
            .then(onHash)
            .catch(() => {
              web3
                .sendSignedTransaction(bufferToHex(tx.serialize()))
                .on('transactionHash', onHash)
                .on('error', error => {
                  txActivity.status = ActivityStatus.failed;
                  activityState
                    .addActivities([txActivity], {
                      address: txActivity.from,
                      network: network.value.name,
                    })
                    .then(() => {
                      trackSendEvents(SendEventType.SendAPIFailed, {
                        network: network.value.name,
                        error: error.message,
                      });
                      Resolve.value({
                        error: getCustomError(error.message),
                      });
                    });
                });
            });
        })
        .catch(err => {
          trackSendEvents(SendEventType.SendAPIFailed, {
            network: network.value.name,
            error: err.error,
          });
          Resolve.value(err);
        });
    },
  );
};
const deny = async () => {
  trackSendEvents(SendEventType.SendAPIDecline, {
    network: network.value.name,
  });
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};

const toggleSelectFee = () => {
  isOpenSelectFee.value = !isOpenSelectFee.value;
};
const selectFee = (type: GasPriceTypes) => {
  selectedFee.value = type;
  toggleSelectFee();
};
const toggleData = () => {
  isOpenData.value = !isOpenData.value;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.provider-verify-transaction {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

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
    margin-bottom: 16px;
  }

  &__dapp-favicon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__dapp-text {
    flex: 1;
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

  // Amount Card
  &__amount-card {
    width: 100%;
    background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #8b5cf6 100%);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 14px;
    box-sizing: border-box;
    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.25);
  }

  &__amount-label {
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 10px;
  }

  &__amount-main {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__amount-token {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    padding: 4px;
    box-sizing: border-box;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }

  &__amount-info {
    flex: 1;
    min-width: 0;
  }

  &__amount-value {
    font-size: 24px;
    font-weight: 700;
    color: white;
    line-height: 1.2;
    display: flex;
    align-items: baseline;
    gap: 6px;
    flex-wrap: wrap;

    span {
      font-size: 14px;
      font-weight: 600;
      opacity: 0.85;
    }
  }

  &__amount-fiat {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.75);
    margin-top: 2px;
  }

  // Approval Hero
  &__approval-notice {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: rgba(245, 158, 11, 0.06);
    border: 1px solid rgba(245, 158, 11, 0.15);
    border-radius: 10px;
    margin-bottom: 14px;
    box-sizing: border-box;

    p {
      font-size: 13px;
      line-height: 1.4;
      color: @primaryLabel;
      margin: 0;
      flex: 1;

      strong {
        font-weight: 600;
      }
    }
  }

  &__approval-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    border-radius: 6px;
    flex-shrink: 0;

    span {
      font-size: 10px;
      font-weight: 700;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
  }

  &__approval-amount {
    font-weight: 600;
    color: #d97706;
  }

  // Transaction Flow
  &__flow {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  &__flow-card {
    background: @white;
    border: 1px solid @gray01;
    border-radius: 12px;
    padding: 12px;
    position: relative;
    transition: all 0.2s ease;

    &:hover {
      border-color: @gray02;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
  }

  &__flow-indicator {
    position: absolute;
    top: -8px;
    left: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;

    &.from {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
    }

    &.to {
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      color: white;
    }
  }

  &__flow-content {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 4px;
  }

  &__flow-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__flow-details {
    flex: 1;
    min-width: 0;

    h5 {
      font-size: 14px;
      font-weight: 600;
      color: @primaryLabel;
      margin: 0;
    }

    p {
      font-size: 12px;
      color: @secondaryLabel;
      margin: 0;
    }

    &.full {
      flex: 1;
    }
  }

  &__flow-address {
    font-family: 'Roboto Mono', monospace;
    font-size: 11px !important;
    word-break: break-all;
    line-height: 1.4;
  }

  &__flow-balance {
    text-align: right;

    span {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: @primaryLabel;
    }

    small {
      font-size: 10px;
      color: @secondaryLabel;
      text-transform: uppercase;
    }
  }

  &__flow-arrow {
    display: flex;
    justify-content: center;
    padding: 6px 0;
    color: @gray02;
  }

  // Fee Card
  &__fee-card {
    width: 100%;
    margin-top: 12px;

    .send-fee-select {
      background: @white;
      border: 1px solid @gray01;
      border-radius: 10px;
      padding: 10px 12px;
      height: auto;
      transition: all 0.2s ease;

      &:hover {
        border-color: @primary;
        box-shadow: 0 0 0 3px rgba(117, 89, 209, 0.08);
      }
    }
  }

  // Data Button
  &__data-btn {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    padding: 10px 0 4px;
    cursor: pointer;
    color: @secondaryLabel;
    font-size: 12px;
    font-weight: 500;
    transition: color 0.2s ease;

    &:hover {
      color: @primary;
    }

    svg {
      width: 10px;
      height: 10px;
      transition: transform 0.2s ease;

      &.rotated {
        transform: rotate(90deg);
      }
    }
  }

  &__data-box {
    width: 100%;
    background: @lightBg;
    border-radius: 8px;
    padding: 10px;
    margin-top: 6px;
    max-height: 70px;
    overflow-y: auto;
    box-sizing: border-box;

    code {
      font-family: 'Roboto Mono', monospace;
      font-size: 10px;
      color: @secondaryLabel;
      word-break: break-all;
      line-height: 1.4;
    }
  }

  // Error Message
  &__error {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    padding: 10px 12px;
    background: rgba(249, 89, 89, 0.08);
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;

    svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: @error;
    }

    p {
      font-size: 12px;
      color: @error;
      margin: 0;
      line-height: 1.4;
    }
  }
}

.common-popup {
  padding: 0 !important;

  &__header {
    padding: 12px 20px !important;
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
    width: 70px !important;
    height: auto !important;
  }

  &__network {
    position: static !important;
    display: flex !important;
    align-items: center !important;
    padding: 6px 10px !important;
    background: @lightBg !important;
    border-radius: 20px !important;

    img {
      width: 16px !important;
      height: 16px !important;
      margin-right: 6px !important;
    }

    p {
      font-size: 11px !important;
      line-height: 14px !important;
      font-weight: 600 !important;
      color: @primaryLabel !important;
    }
  }

  &__buttons {
    padding: 12px 20px !important;
    gap: 12px !important;
    background: @white !important;
    border-top: 1px solid @gray01 !important;

    &-cancel,
    &-send {
      width: auto !important;
      flex: 1 !important;
    }

    .button {
      height: 44px !important;
      line-height: 44px !important;
      border-radius: 12px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
    }
  }
}

// Transaction Fee Popup Fixes
.popup {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-height: 600px !important;
  overflow: hidden !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  display: none !important;

  &.show {
    display: flex !important;
    align-items: flex-end !important;
  }
}

.transaction-fee {
  &__wrap {
    max-height: 480px !important;
    overflow-y: auto !important;
  }

  &__as-popup {
    width: 100% !important;
    max-width: 100% !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    max-height: 520px !important;
    border-radius: 16px 16px 0 0 !important;
    margin: 0 !important;
    box-sizing: border-box !important;
  }

  &__header {
    h3 {
      font-size: 18px !important;
      line-height: 24px !important;
    }
  }

  &__info {
    padding: 0 16px !important;

    &-amount {
      &-fiat {
        font-size: 18px !important;
        line-height: 24px !important;
      }

      &-crypto {
        font-size: 14px !important;
        line-height: 20px !important;
      }
    }

    &-text {
      font-size: 12px !important;
      line-height: 18px !important;
    }

    &-time {
      span {
        font-size: 14px !important;
        line-height: 20px !important;
      }
    }
  }
}

.transaction-fee-item {
  padding: 12px 16px !important;

  &__type {
    h5 {
      font-size: 14px !important;
      line-height: 20px !important;
    }

    p {
      font-size: 12px !important;
      line-height: 16px !important;
    }
  }

  &__amount {
    font-size: 12px !important;
  }
}
</style>
