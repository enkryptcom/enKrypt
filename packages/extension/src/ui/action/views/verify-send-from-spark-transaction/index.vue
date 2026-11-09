<template>
  <div class="container" :class="{ popup: isPopup }">
    <div v-if="!!selectedNetwork" class="verify-transaction">
      <custom-scrollbar
        ref="verifyScrollRef"
        class="verify-transaction__scroll-area"
      >
        <div class="verify-transaction__header" :class="{ popup: isPopup }">
          <h3>Verify Transaction</h3>
          <a v-if="!isPopup" class="verify-transaction__close" @click="close">
            <close-icon />
          </a>
        </div>
        <p class="verify-transaction__description" :class="{ popup: isPopup }">
          Double check the information and confirm transaction
        </p>
        <div
          class="verify-transaction__info"
          :class="{ popup: isPopup, border: isHasScroll() }"
        >
          <verify-transaction-network :network="network" />
          <verify-transaction-account
            :name="txData.fromAddressName"
            :address="txData.fromAddress"
            :from="true"
            :network="network"
          />
          <verify-transaction-account
            :address="txData.toAddress"
            :network="network"
          />
          <div v-if="isBuilding" class="verify-transaction__status">
            <p>{{ buildStatus.title }}</p>
            <div class="verify-transaction__progress">
              <div
                class="verify-transaction__progress-bar"
                :style="{ width: `${buildStatus.percent}%` }"
              />
            </div>
            <p v-if="buildStatus.hint" class="verify-transaction__hint">
              {{ buildStatus.hint }}
            </p>
          </div>
          <template v-else-if="builtTx">
            <verify-transaction-amount :token="displayToken" />
            <verify-transaction-fee :fee="feeInfo" />
            <p class="verify-transaction__total">
              Total from your Spark balance: {{ totalText }}
              {{ txData.toToken.symbol }}
            </p>
          </template>
          <p v-if="errorMsg" class="verify-transaction__error">
            {{ errorMsg }}
          </p>
        </div>
      </custom-scrollbar>

      <div
        class="verify-transaction__buttons"
        :class="{ popup: isPopup, border: isHasScroll() }"
      >
        <div class="verify-transaction__buttons-cancel">
          <base-button
            title="Back"
            :click="close"
            :gray="true"
            :disabled="isProcessing"
          />
        </div>
        <div class="verify-transaction__buttons-send">
          <base-button
            title="Confirm and send"
            :click="sendAction"
            :disabled="isProcessing || isBuilding || !builtTx"
          />
        </div>
      </div>
    </div>

    <send-process
      v-if="isProcessing"
      v-model="isProcessing"
      :to-address="txData.toAddress"
      :network="network"
      :token="txData.toToken"
      :is-done="isSendDone"
      :is-window-popup="isWindowPopup"
    />

    <spark-unlock-dialog
      v-if="isUnlockOpen"
      @unlocked="onUnlocked"
      @cancel="onUnlockCancel"
    />
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  ref,
  ComponentPublicInstance,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CloseIcon from '@action/icons/common/close-icon.vue';
import BaseButton from '@action/components/base-button/index.vue';
import VerifyTransactionNetwork from '@/providers/common/ui/verify-transaction/verify-transaction-network.vue';
import VerifyTransactionAccount from '@/providers/common/ui/verify-transaction/verify-transaction-account.vue';
import VerifyTransactionFee from '@/providers/common/ui/verify-transaction/verify-transaction-fee.vue';
import VerifyTransactionAmount from '@/providers/common/ui/verify-transaction/verify-transaction-amount.vue';
import SendProcess from '@action/views/send-process/index.vue';
import { getCurrentContext } from '@/libs/messenger/extension';
import { DEFAULT_BTC_NETWORK, getNetworkByName } from '@/libs/utils/networks';
import { ActivityStatus, Activity, ActivityType } from '@/types/activity';
import SparkHistoryState from '@/libs/utils/spark-history-state';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';
import { VerifyTransactionParams } from '@/providers/bitcoin/ui/types';
import {
  sendFromSparkAddress,
  sparkSendLock,
  SendFromSparkAddressResult,
  SparkSpendProgress,
} from '@/libs/spark-handler';
import { markCoinsAsPendingSpent } from '@/libs/utils/updateAndSync/markCoinsAsPendingSpent';
import { fromBase } from '@enkryptcom/utils';
import BigNumber from 'bignumber.js';
import { BaseNetwork } from '@/types/base-network';
import FiroAPI from '@/providers/bitcoin/libs/api-firo';
import { isFiroSecretsRequiredError } from '@/providers/bitcoin/libs/firo-wallet/errors';
import { BaseFiroWallet } from '@/providers/bitcoin/libs/firo-wallet/base-firo-wallet';
import SparkUnlockDialog from './components/spark-unlock-dialog.vue';
import { getSparkHistoryOptions } from '@/libs/utils/spark-history';

const emits = defineEmits<{
  (e: 'update:spark-state-changed', network: BaseNetwork): void;
}>();

const route = useRoute();
const router = useRouter();
const selectedNetwork: string = route.query.id as string;
const txData: VerifyTransactionParams = JSON.parse(
  Buffer.from(route.query.txData as string, 'base64').toString('utf8'),
);

const isProcessing = ref(false);
const network = ref<BitcoinNetwork>(DEFAULT_BTC_NETWORK);
const isSendDone = ref(false);
const isPopup: boolean = getCurrentContext() === 'new-window';
const verifyScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
const isWindowPopup = ref(false);
const errorMsg = ref('');
const isBuilding = ref(true);
const builtTx = ref<SendFromSparkAddressResult | null>(null);
const buildProgress = ref<SparkSpendProgress | null>(null);
const proveStartedAt = ref(0);
const now = ref(Date.now());
let nowTimer: ReturnType<typeof setInterval> | undefined;
const buildAbort = new AbortController();

defineExpose({ verifyScrollRef });

const formatTimeLeft = (ms: number) => {
  const minutes = Math.round(ms / 60_000);
  return minutes >= 1 ? `About ${minutes} min left` : 'Less than a minute left';
};

const buildStatus = computed(() => {
  const progress = buildProgress.value;
  if (progress?.stage === 'prepare') {
    const percent = progress.total
      ? Math.floor((progress.done / progress.total) * 100)
      : 0;
    return { title: `Preparing coin sets… ${percent}%`, percent, hint: '' };
  }
  if (progress?.stage === 'prove') {
    const elapsed = now.value - proveStartedAt.value;
    const coins = progress.inputs === 1 ? 'coin' : 'coins';
    return {
      title: `Creating private proofs for ${progress.inputs} ${coins}…`,
      // Only an estimate: the wasm does not report progress while proving.
      percent: Math.min(95, (elapsed / progress.estimatedMs) * 100),
      hint:
        elapsed < progress.estimatedMs
          ? formatTimeLeft(progress.estimatedMs - elapsed)
          : 'Taking longer than usual, almost done…',
    };
  }
  return { title: 'Checking your coins…', percent: 0, hint: '' };
});

const onBuildProgress = (progress: SparkSpendProgress) => {
  if (progress.stage === 'prove') {
    proveStartedAt.value = Date.now();
    now.value = proveStartedAt.value;
  }
  buildProgress.value = progress;
};

const toDisplayAmount = (satoshis: number) =>
  fromBase(String(satoshis), txData.toToken.decimals);

const displayToken = computed(() => {
  const recipientAmount = builtTx.value?.recipientAmount ?? 0;
  return {
    ...txData.toToken,
    amount: String(recipientAmount),
    valueUSD: new BigNumber(txData.toToken.price || '0')
      .times(toDisplayAmount(recipientAmount))
      .toString(),
  };
});

const feeInfo = computed(() => {
  const fee = builtTx.value?.fee ?? 0;
  return {
    nativeValue: toDisplayAmount(fee),
    fiatValue: new BigNumber(txData.toToken.price || '0')
      .times(toDisplayAmount(fee))
      .toString(),
    nativeSymbol: txData.toToken.symbol,
    fiatSymbol: 'USD',
  };
});

const totalText = computed(() =>
  toDisplayAmount(
    (builtTx.value?.recipientAmount ?? 0) + (builtTx.value?.fee ?? 0),
  ),
);

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const firoWallet = new BaseFiroWallet();
const isUnlockOpen = ref(false);
let afterUnlock: (() => void) | null = null;

/** The Firo secret is cleared whenever the background restarts, which is
 * likely during a long build. Ask for the password here instead of sending
 * the user to the lock screen, which would throw the built spend away. */
const askForPassword = (then: () => void) => {
  afterUnlock = then;
  isUnlockOpen.value = true;
};

const onUnlocked = () => {
  isUnlockOpen.value = false;
  const then = afterUnlock;
  afterUnlock = null;
  then?.();
};

const onUnlockCancel = () => {
  isUnlockOpen.value = false;
  afterUnlock = null;
  errorMsg.value = 'Your password is needed to continue.';
};

/** Builds once the secret is there; asks for the password first if not. */
const startBuild = async () => {
  if (!(await firoWallet.hasSecret())) {
    askForPassword(startBuild);
    return;
  }
  await buildTx();
};

/** Builds the spend once so the fee can be shown before the user confirms.
 * Returns false when it failed (the error is already on screen). */
const buildTx = async (): Promise<boolean> => {
  isBuilding.value = true;
  errorMsg.value = '';
  builtTx.value = null;
  buildProgress.value = null;
  nowTimer = setInterval(() => (now.value = Date.now()), 1000);
  try {
    await sparkSendLock.run(async () => {
      builtTx.value = await sendFromSparkAddress(
        network.value.networkInfo,
        txData.toAddress,
        fromBase(txData.toToken.amount, txData.toToken.decimals).toString(),
        {
          isMax: txData.isMax,
          onProgress: onBuildProgress,
          signal: buildAbort.signal,
        },
      );
    });
    return true;
  } catch (error) {
    if (buildAbort.signal.aborted) return false;
    if (isFiroSecretsRequiredError(error)) {
      askForPassword(startBuild);
    } else {
      errorMsg.value = getErrorMessage(error);
      console.error('ERROR', error);
    }
    return false;
  } finally {
    clearInterval(nowTimer);
    isBuilding.value = false;
  }
};

onBeforeMount(async () => {
  network.value = (await getNetworkByName(selectedNetwork)!) as BitcoinNetwork;
  trackSendEvents(SendEventType.SendVerify, { network: network.value.name });
  await startBuild();
});

// Leaving the page stops a build that is still running.
onBeforeUnmount(() => {
  buildAbort.abort();
  clearInterval(nowTimer);
});

const close = () => {
  if (getCurrentContext() === 'popup') {
    router.go(-1);
  } else {
    window.close();
  }
};

const sendAction = async () => {
  // Broadcasting needs no key, but the coin sync right after it does. The
  // secret may have expired while the user waited on a long build, so ask
  // for the password now, with the built spend still on screen.
  if (!(await firoWallet.hasSecret())) {
    askForPassword(sendAction);
    return;
  }
  try {
    isProcessing.value = true;
    errorMsg.value = '';
    trackSendEvents(SendEventType.SendApprove, {
      network: network.value.name,
    });
    const txActivity: Activity = {
      from: network.value.displayAddress(txData.fromAddress),
      to: txData.toAddress,
      isIncoming: txData.fromAddress === txData.toAddress,
      network: network.value.name,
      status: ActivityStatus.pending,
      timestamp: new Date().getTime(),
      token: {
        decimals: txData.toToken.decimals,
        icon: txData.toToken.icon,
        name: txData.toToken.name,
        symbol: txData.toToken.symbol,
        price: txData.toToken.price,
      },
      type: ActivityType.transaction,
      value: txData.toToken.amount,
      transactionHash: '',
    };

    const activityState = new SparkHistoryState();

    const api = (await network.value.api()) as unknown as FiroAPI;

    // The spend pins its cover sets by block hash, so it stays valid while
    // the user reads the screen; only build when there is no tx yet.
    if (!builtTx.value) {
      if (!(await buildTx())) {
        isProcessing.value = false;
        return;
      }
    }
    const built = builtTx.value;
    if (!built) throw new Error('Transaction data is undefined');
    txActivity.value = String(built.recipientAmount);

    await sparkSendLock.run(async () => {
      const { hex: rawTx, selectedTags } = built;

      console.log('rawTx in vue', rawTx?.slice(0, 14));

      try {
        const { txid } = await api.broadcastTx(rawTx);

        await markCoinsAsPendingSpent(selectedTags, txid);

        trackSendEvents(SendEventType.SendComplete, {
          network: network.value.name,
        });
        await activityState
          .addActivities(
            [
              {
                ...txActivity,
                ...{ transactionHash: txid },
              },
            ],
            getSparkHistoryOptions(network.value.name),
          )
          .catch(error => {
            console.error('Failed to save Spark send to history', error);
          });

        isSendDone.value = true;
        if (getCurrentContext() === 'popup') {
          setTimeout(() => {
            isProcessing.value = false;
            router.go(-2);
          }, 4500);
        } else {
          setTimeout(() => {
            isProcessing.value = false;
            window.close();
          }, 1500);
        }
        emits('update:spark-state-changed', network.value);
      } catch (error: any) {
        trackSendEvents(SendEventType.SendFailed, {
          network: network.value.name,
          error: error.message,
        });
        txActivity.status = ActivityStatus.failed;
        activityState.addActivities(
          [txActivity],
          getSparkHistoryOptions(network.value.name),
        );

        isProcessing.value = false;
        errorMsg.value = getErrorMessage(error);
        console.error('ERROR', error);
      }
    });
  } catch (error: any) {
    trackSendEvents(SendEventType.SendFailed, {
      network: network.value.name,
      error: error.message,
    });

    isProcessing.value = false;
    if (isFiroSecretsRequiredError(error)) {
      askForPassword(sendAction);
      return;
    }
    errorMsg.value = getErrorMessage(error);
    console.error('ERROR', error);
  }
};

const isHasScroll = () => {
  if (verifyScrollRef.value) {
    return verifyScrollRef.value.$el.classList.contains('ps--active-y');
  }

  return false;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

.container {
  width: 100%;
  height: 600px;
  background-color: @white;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
  position: relative;

  &.popup {
    box-shadow: none;
  }
}

.verify-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;

  &__header {
    position: relative;
    padding: 24px 72px 12px 32px;

    &.popup {
      padding: 24px 0 12px 0;
    }

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      color: @primaryLabel;
      margin: 0;
    }
  }

  &__close {
    position: absolute;
    top: 20px;
    right: 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__description {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    padding: 4px 141px 16px 32px;
    margin: 0;

    &.popup {
      padding: 4px 0 16px 0;
    }
  }

  &__info {
    border: 1px solid @gray02;
    box-sizing: border-box;
    border-radius: 10px;
    margin: 0 32px 0 32px;

    &.popup {
      margin: 0;
      margin-bottom: 56px;
    }
  }

  &__status,
  &__total {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @secondaryLabel;
    margin: 0;
    padding: 12px 16px;

    p {
      margin: 0;
    }
  }

  &__progress {
    height: 4px;
    margin-top: 8px;
    border-radius: 2px;
    background: @gray02;
    overflow: hidden;
  }

  &__progress-bar {
    height: 100%;
    background: @primary;
    transition: width 1s linear;
  }

  &__hint {
    margin-top: 6px !important;
    font-size: 12px;
    line-height: 16px;
  }

  &__error {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @error;
    margin: 0;
    padding: 12px 16px;
    word-break: break-word;
  }

  &__buttons {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 32px 32px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;

    &.popup {
      padding: 24px;
      background: @white;
    }

    &.border {
      box-shadow:
        0 0 6px rgba(0, 0, 0, 0.05),
        0 0 1px rgba(0, 0, 0, 0.25);
    }

    &-cancel {
      width: 170px;
    }

    &-send {
      width: 218px;
    }
  }

  &__scroll-area {
    position: relative;
    width: calc(~'100% + 53px');
    height: calc(~'100% - 88px');
    margin: 0;
    padding: 0 53px 0 0 !important;
    margin-right: -53px;
    box-sizing: border-box;

    &.ps--active-y {
      padding-bottom: 0 !important;
    }

    & > .ps__rail-y {
      right: 0 !important;
    }
  }
}
</style>
