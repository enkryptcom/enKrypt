<template>
  <div class="container">
    <div class="swap-best-offer">
      <div
        class="swap-best-offer__header"
        :class="{ border: isHasScroll() && scrollProgress > 0 }"
      >
        <h3>Swap</h3>
        <a class="swap-best-offer__close" @click="close">
          <close-icon />
        </a>
      </div>

      <div class="swap-best-offer__wrap">
        <custom-scrollbar
          ref="bestOfferScrollRef"
          class="swap-best-offer__scroll-area"
          :settings="scrollSettings({ suppressScrollX: true })"
          :style="{ maxHeight: height + 'px' }"
          @ps-scroll-y="handleScroll"
        >
          <swap-best-offer-block
            :trades="swapData.trades"
            :picked-trade="pickedTrade"
            :from-token="swapData.fromToken"
            :to-token="swapData.toToken"
            @update:picked-trade="selectTrade"
          />
          <best-offer-error
            v-if="warning === SwapBestOfferWarnings.NOT_ENOUGH_GAS"
            :not-enought-e-t-h="true"
            :native-symbol="network?.currencyName ? network.currencyName : ''"
            :price="priceDifference"
            :native-value="gasDifference"
          />
          <best-offer-error
            v-if="warning === SwapBestOfferWarnings.EXISTENTIAL_DEPOSIT"
            :below-deposit="true"
            :native-symbol="network?.name ? network.name : ''"
            :price="priceDifference"
            :native-value="gasDifference"
          />
          <best-offer-error
            v-if="warning === SwapBestOfferWarnings.BAD_PRICE"
            :bad-trade="true"
          />
          <send-fee-select
            v-if="Object.keys(gasCostValues).length > 1"
            :fee="gasCostValues[selectedFee]"
            :selected="selectedFee"
            :in-swap="true"
            @open-popup="toggleSelectFee"
          />
          <send-fee-display
            v-else
            :fee="gasCostValues[selectedFee]"
            :in-swap="true"
          />
        </custom-scrollbar>

        <transaction-fee-view
          :fees="gasCostValues"
          :show-fees="isOpenSelectFee"
          :selected="selectedFee"
          :is-header="true"
          @close-popup="toggleSelectFee"
          @gas-type-changed="selectFee"
        />
      </div>

      <div class="swap-best-offer__buttons" :class="{ border: isHasScroll() }">
        <div class="swap-best-offer__buttons-cancel">
          <base-button title="Back" :click="back" :no-background="true" />
        </div>
        <div class="swap-best-offer__buttons-send">
          <base-button
            :title="sendButtonTitle()"
            :click="sendAction"
            :disabled="isDisabled"
          />
        </div>
      </div>
    </div>
    <swap-initiated
      v-if="isInitiated"
      :is-loading="isTXSendLoading"
      :from-token="swapData.fromToken"
      :to-token="swapData.toToken"
      :from-amount="pickedTrade.fromTokenAmount.toString()"
      :to-amount="pickedTrade.toTokenAmount.toString()"
      :is-hardware="account ? account.isHardware : false"
      :is-error="isTXSendError"
      :error-message="TXSendErrorMessage"
      @update:close="close"
      @update:try-again="sendAction"
    />
    <swap-looking
      v-show="isLooking"
      :loading-type="SWAP_LOADING.LOOKING_FOR_OFFERS"
      :close="() => {}"
    />
  </div>
</template>

<script setup lang="ts">
import { ComponentPublicInstance, computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import SwapBestOfferBlock from "./components/swap-best-offer-block/index.vue";
import SwapInitiated from "@action/views/swap-initiated/index.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import BestOfferError from "./components/swap-best-offer-block/components/best-offer-error.vue";
import SendFeeSelect from "@/providers/common/ui/send-transaction/send-fee-select.vue";
import SendFeeDisplay from "@/providers/polkadot/ui/send-transaction/components/send-fee-display.vue";
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
import SwapLooking from "../../components/swap-loading/index.vue";
import { SWAP_LOADING } from "../../types";
import scrollSettings from "@/libs/utils/scroll-settings";
import { BaseNetwork } from "@/types/base-network";
import { toBN } from "web3-utils";
import BN from "bn.js";
import {
  Activity,
  ActivityStatus,
  ActivityType,
  SwapRawInfo,
} from "@/types/activity";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import { GasFeeType, GasPriceTypes } from "@/providers/common/types";
import BigNumber from "bignumber.js";
import { defaultGasCostVals } from "@/providers/common/libs/default-vals";
import { SwapBestOfferWarnings } from "../../types";
import { NATIVE_TOKEN_ADDRESS } from "@/providers/ethereum/libs/common";
import { EnkryptAccount } from "@enkryptcom/types";
import { getNetworkByName } from "@/libs/utils/networks";
import {
  getNetworkInfoByName,
  NetworkType,
  ProviderSwapResponse,
  SupportedNetworkName,
  SwapToken,
} from "@enkryptcom/swap";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import { SwapData, ProviderResponseWithStatus } from "../../types";
import { getSwapTransactions } from "../../libs/swap-txs";
import { getEVMTransactionFees } from "../../libs/evm-gasvals";
import { getSubstrateGasVals } from "../../libs/substrate-gasvals";
import { executeSwap } from "../../libs/send-transactions";
import { fromBase, toBase } from "@enkryptcom/utils";
import ActivityState from "@/libs/activity-state";
import { getBitcoinGasVals } from "../../libs/bitcoin-gasvals";

const router = useRouter();
const route = useRoute();

const isInitiated = ref(false);
const bestOfferScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
const scrollProgress = ref(0);
const height = ref(460);
const selectedNetwork: string = route.query.id as string;
const network = ref<BaseNetwork>();
const account = ref<EnkryptAccount>();
const swapData: SwapData = JSON.parse(
  Buffer.from(route.query.swapData as string, "base64").toString("utf8")
);
swapData.trades.forEach((t) => {
  t.fromTokenAmount = toBN(`0x${t.fromTokenAmount}`);
  t.toTokenAmount = toBN(`0x${t.toTokenAmount}`);
});
swapData.existentialDeposit = toBN(`0x${swapData.existentialDeposit}`);
swapData.nativeBalance = toBN(`0x${swapData.nativeBalance}`);
swapData.fromToken.balance = toBN(`0x${swapData.fromToken.balance}`);
swapData.toToken.balance = toBN(`0x${swapData.toToken.balance}`);
const networkInfo = getNetworkInfoByName(
  selectedNetwork as SupportedNetworkName
);
const selectedFee = ref<GasPriceTypes>(GasPriceTypes.REGULAR);
const pickedTrade = ref<ProviderResponseWithStatus>(
  swapData.trades[swapData.trades.length - 1]
);
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const balance = ref<BN>(swapData.nativeBalance);
const KeyRing = new PublicKeyRing();
const isWindowPopup = ref(false);
const isOpenSelectFee = ref(false);

const warning = ref<SwapBestOfferWarnings>();
const gasDifference = ref<string>();
const priceDifference = ref<string>();
const isTXSendLoading = ref<boolean>(false);
const isTXSendError = ref(false);
const TXSendErrorMessage = ref("");
const isLooking = ref(true);

const setWarning = async () => {
  if (balance.value.ltn(0)) return;
  const currentGasCost = toBase(
    gasCostValues.value[selectedFee.value].nativeValue,
    network.value!.decimals
  );

  const totalNativeCost =
    swapData.fromToken.address === NATIVE_TOKEN_ADDRESS
      ? toBN(currentGasCost).add(pickedTrade.value.fromTokenAmount)
      : toBN(currentGasCost);

  if (networkInfo.type === NetworkType.Substrate) {
    const balanceAfterTransaction = swapData.nativeBalance.sub(totalNativeCost);
    if (balanceAfterTransaction.lt(swapData.existentialDeposit)) {
      warning.value = SwapBestOfferWarnings.EXISTENTIAL_DEPOSIT;
      return;
    }
  } else {
    if (swapData.nativeBalance.sub(totalNativeCost).ltn(0)) {
      gasDifference.value = fromBase(
        swapData.nativeBalance.sub(totalNativeCost).abs().toString(),
        network.value!.decimals
      );
      priceDifference.value = BigNumber(gasDifference.value)
        .times(swapData.nativePrice)
        .toString();
      warning.value = SwapBestOfferWarnings.NOT_ENOUGH_GAS;
      return;
    }
  }
  if (1 - Number(swapData.priceDifference) < -0.2) {
    warning.value = SwapBestOfferWarnings.BAD_PRICE;
    return;
  }
  warning.value = SwapBestOfferWarnings.NONE;
};

defineExpose({ bestOfferScrollRef });

const getTransactionFees = async (
  networkName: SupportedNetworkName,
  trade: ProviderResponseWithStatus
): Promise<GasFeeType> => {
  const transactionObjects = await getSwapTransactions(
    networkName,
    trade.transactions
  );
  if (networkInfo.type === NetworkType.EVM) {
    return getEVMTransactionFees(
      transactionObjects!,
      network.value as EvmNetwork,
      swapData.nativePrice
    );
  } else if (networkInfo.type === NetworkType.Substrate) {
    return getSubstrateGasVals(
      transactionObjects!,
      swapData.fromAddress,
      network.value!,
      swapData.nativePrice
    ) as Promise<GasFeeType>;
  } else if (networkInfo.type === NetworkType.Bitcoin) {
    return getBitcoinGasVals(
      transactionObjects!,
      network.value!,
      swapData.nativePrice
    );
  } else {
    throw new Error("unsupported network type");
  }
};

const setTransactionFees = async () => {
  gasCostValues.value = await getTransactionFees(
    selectedNetwork as SupportedNetworkName,
    pickedTrade.value
  );
  setWarning();
};

onMounted(async () => {
  isLooking.value = true;
  network.value = (await getNetworkByName(selectedNetwork))!;
  account.value = await KeyRing.getAccount(swapData.fromAddress);
  isWindowPopup.value = account.value.isHardware;
  let tempBestTrade = pickedTrade.value;
  let tempFinalToFiat = 0;
  for (const trade of swapData.trades) {
    const toTokenFiat = new SwapToken(swapData.toToken).getRawToFiat(
      trade.toTokenAmount
    );
    const gasCosts = await getTransactionFees(
      selectedNetwork as SupportedNetworkName,
      trade
    );
    const gasCostFiat = parseFloat(gasCosts[selectedFee.value].fiatValue);
    const finalToFiat = toTokenFiat - gasCostFiat;
    if (finalToFiat > tempFinalToFiat) {
      tempBestTrade = trade;
      tempFinalToFiat = finalToFiat;
    }
  }
  pickedTrade.value = tempBestTrade;
  await setTransactionFees();
  isLooking.value = false;
});

const back = () => {
  if (!isWindowPopup.value) {
    router.go(-1);
  } else {
    window.close();
  }
};

const close = () => {
  if (!isWindowPopup.value) {
    router.go(-2);
  } else {
    window.close();
  }
};

const sendButtonTitle = () => "Proceed with swap";

const isDisabled = computed(() => {
  if (
    (warning.value !== SwapBestOfferWarnings.NONE &&
      warning.value !== SwapBestOfferWarnings.BAD_PRICE) ||
    gasCostValues.value[selectedFee.value].nativeValue === "0"
  ) {
    return true;
  }
  return false;
});

const sendAction = async () => {
  if (pickedTrade.value) {
    await setTransactionFees();
    isTXSendError.value = false;
    TXSendErrorMessage.value = "";
    isTXSendLoading.value = true;
    isInitiated.value = true;
    await executeSwap({
      from: account.value!,
      fromToken: swapData.fromToken,
      gasPriceType: selectedFee.value,
      network: network.value!,
      networkType: networkInfo.type,
      swap: pickedTrade.value,
      toToken: swapData.toToken,
    })
      .then((hashes) => {
        pickedTrade.value.status!.options.transactionHashes = hashes;
        const swapRaw: SwapRawInfo = {
          fromToken: swapData.fromToken,
          toToken: swapData.toToken,
          status: pickedTrade.value.status!,
        };
        const swapActivity: Activity = {
          from: network.value!.displayAddress(account.value!.address),
          to: swapData.toAddress,
          token: {
            decimals: swapData.toToken.decimals,
            icon: swapData.toToken.logoURI,
            name: swapData.toToken.name,
            symbol: swapData.toToken.symbol,
            coingeckoID: swapData.toToken.cgId,
            price: swapData.toToken.price
              ? swapData.toToken.price.toString()
              : "0",
          },
          isIncoming: account.value!.address === swapData.toAddress,
          network: network.value!.name,
          status: ActivityStatus.pending,
          timestamp: new Date().getTime(),
          type: ActivityType.swap,
          value: pickedTrade.value.toTokenAmount.toString(),
          transactionHash: `${hashes[0]}-swap`,
          rawInfo: JSON.parse(JSON.stringify(swapRaw)),
        };
        const activityState = new ActivityState();
        activityState.addActivities([swapActivity], {
          address: swapActivity.from,
          network: network.value!.name,
        });
      })
      .catch((err) => {
        console.error(err);
        isTXSendError.value = true;
        TXSendErrorMessage.value = err.error ? err.error.message : err.message;
      });
    isTXSendLoading.value = false;
  } else {
    console.error("No trade yet");
  }
};

const handleScroll = (e: any) => {
  const progress = Number(e.target.lastChild.style.top.replace("px", ""));
  scrollProgress.value = progress;
  height.value = 460 + Math.min(12, progress);
};

const isHasScroll = () => {
  if (bestOfferScrollRef.value) {
    return bestOfferScrollRef.value.$el.classList.contains("ps--active-y");
  }
};

const toggleSelectFee = () => {
  isOpenSelectFee.value = !isOpenSelectFee.value;
};

const selectFee = (option: GasPriceTypes) => {
  selectedFee.value = option;
  toggleSelectFee();
  setTransactionFees();
};

const selectTrade = (trade: ProviderSwapResponse) => {
  console.log(trade.provider);
  pickedTrade.value = trade;
  setTransactionFees();
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.container {
  width: 100%;
  height: 600px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
  position: relative;
}
.swap-best-offer {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;

  &__header {
    position: relative;
    padding: 24px 72px 12px 32px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 32px;
      color: @primaryLabel;
      margin: 0;
    }

    &.border {
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05),
        0px 0px 1px rgba(0, 0, 0, 0.25);

      padding: 14px 72px 12px 32px;

      h3 {
        font-size: 20px;
        line-height: 28px;
      }
    }
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }

  &__wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
    height: calc(~"100% - 128px");
  }

  &__buttons {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 16px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;
    background-color: @white;

    &.border {
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05),
        0px 0px 1px rgba(0, 0, 0, 0.25);
    }

    &-cancel {
      width: 140px;
    }

    &-send {
      width: 248px;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    margin: 0;
    box-sizing: border-box;
    padding: 0 32px !important;

    &.ps--active-y {
      padding-bottom: 16px !important;
    }

    & > .ps__rail-y {
      right: 14px !important;
    }
  }
}
</style>
