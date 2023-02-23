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
            :from-amount="swapData.fromAmount"
            @update:picked-trade="selectTrade"
          />
          <best-offer-error
            v-if="warning === SwapBestOfferWarnings.NOT_ENOUGH_GAS"
            :not-enought-e-t-h="true"
            :native-symbol="network?.name ? network.name : ''"
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
          <send-fee-select
            v-if="network?.name && (network as EvmNetwork).chainID"
            :fee="gasCostValues[selectedFee]"
            :in-swap="true"
            @open-popup="toggleSelectFee"
          />
          <send-fee-display v-else :fee="fee" :in-swap="true" />
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
      :from-amount="swapData.fromAmount"
      :to-amount="pickedTrade.minimumReceived"
      :is-hardware="account ? account.isHardware : false"
      :is-error="isTXSendError"
      :error-message="TXSendErrorMessage"
      @update:close="close"
      @update:try-again="sendAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ComponentPublicInstance, computed, onMounted, ref, watch } from "vue";
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
import scrollSettings from "@/libs/utils/scroll-settings";
import { TradeInfo } from "@/providers/swap/types/SwapProvider";
import { BaseToken } from "@/types/base-token";
import { Swap } from "@/providers/swap";
import { BaseNetwork } from "@/types/base-network";
import { toBN } from "web3-utils";
import BN from "bn.js";
import Web3Eth from "web3-eth";
import Transaction from "@/providers/ethereum/libs/transaction";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";
import {
  GasFeeInfo,
  GasFeeType,
  GasPriceTypes,
} from "@/providers/common/types";
import { fromBase } from "@/libs/utils/units";
import BigNumber from "bignumber.js";
import { defaultGasCostVals } from "@/providers/common/libs/default-vals";
import { SwapBestOfferWarnings } from "./components/types";
import { Erc20Token } from "@/providers/ethereum/types/erc20-token";
import { NATIVE_TOKEN_ADDRESS } from "@/providers/ethereum/libs/common";
import { EnkryptAccount } from "@enkryptcom/types";
import { getNetworkByName } from "@/libs/utils/networks";
import PublicKeyRing from "@/libs/keyring/public-keyring";

interface SwapData {
  trades: TradeInfo[];
  fromToken: BaseToken;
  toToken: BaseToken;
  fromAmount: string;
  toAddress: string;
  priceDifference: string;
  swapMax: boolean;
  fromAddress: string;
}

const router = useRouter();
const route = useRoute();
const swap = new Swap();

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
const KeyRing = new PublicKeyRing();
const isWindowPopup = ref(false);
const fee = ref<Partial<GasFeeInfo>>({
  fiatSymbol: "$",
  nativeSymbol: "",
});

const isOpenSelectFee = ref(false);

const selectedFee = ref<GasPriceTypes>(GasPriceTypes.REGULAR);
const pickedTrade = ref<TradeInfo>(swapData.trades[0]);
const balance = ref<BN>(new BN(-1));
const gasCostValues = ref<GasFeeType>(defaultGasCostVals);
const nativeTokenPrice = ref<string>();

const warning = ref<SwapBestOfferWarnings>();
const gasDifference = ref<string>();
const priceDifference = ref<string>();
const isTXSendLoading = ref<boolean>(false);
const isTXSendError = ref(false);
const TXSendErrorMessage = ref("");

const setWarning = async () => {
  if (balance.value.ltn(0)) return;
  if (
    !swapData.swapMax &&
    swapData.fromToken.existentialDeposit &&
    fee.value.nativeValue
  ) {
    const balanceAfterTransaction = new BigNumber(
      fromBase(swapData.fromToken.balance!, swapData.fromToken.decimals)
    )
      .minus(swapData.fromAmount)
      .minus(fee.value.nativeValue);

    if (
      balanceAfterTransaction.lt(
        fromBase(
          swapData.fromToken.existentialDeposit.toString(),
          swapData.fromToken.decimals
        )
      )
    ) {
      warning.value = SwapBestOfferWarnings.EXISTENTIAL_DEPOSIT;
      return;
    }
  } else {
    let totalFees = new BigNumber(
      gasCostValues.value[selectedFee.value].nativeValue
    );

    if (
      (swapData.fromToken as Erc20Token).contract &&
      (swapData.fromToken as Erc20Token).contract === NATIVE_TOKEN_ADDRESS
    ) {
      totalFees = new BigNumber(swapData.fromAmount).plus(totalFees);
    }

    const userBalance = new BigNumber(
      fromBase(balance.value.toString(), network.value?.decimals || 18)
    );

    if (userBalance.minus(totalFees).lt(0)) {
      gasDifference.value = userBalance.minus(totalFees).abs().toString();
      priceDifference.value = userBalance
        .minus(totalFees)
        .abs()
        .times(nativeTokenPrice.value || 0)
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

watch([gasCostValues, selectedFee, fee], () => {
  setWarning();
});

const Tx = computed(() => {
  if (network.value?.name && (network.value as EvmNetwork).chainID) {
    const web3 = new Web3Eth(network.value.node);
    return pickedTrade.value.txs.map((txData) => {
      const tx = new Transaction(
        {
          to: txData.to as `0x${string}`,
          from: txData.from as `0x${string}`,
          data: txData.data,
          chainId: (network.value as EvmNetwork).chainID,
          value: txData.value,
          gas: txData.gas,
        },
        web3
      );
      return tx;
    });
  }
  return null;
});

defineExpose({ bestOfferScrollRef });

onMounted(async () => {
  network.value = (await getNetworkByName(selectedNetwork))!;
  account.value = await KeyRing.getAccount(swapData.fromAddress);
  const api = await network.value.api();
  balance.value = toBN(await api.getBalance(account.value.address));

  isWindowPopup.value = account.value.isHardware;
  fee.value = {
    fiatSymbol: "$",
    nativeSymbol: network.value.name,
  };

  if (Tx.value) {
    setTransactionFees(Tx.value);
    setWarning();
  }

  if (network.value.name === "DOT" || network.value.name === "KSM") {
    fee.value.nativeSymbol = network.value.name;
    fee.value.nativeValue = fromBase(
      swapData.trades[0].txs[0].gas as `0x${string}`,
      network.value.decimals
    );

    if (network.value.coingeckoID) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const params = new URLSearchParams();
      params.append("ids", network.value.coingeckoID!);
      params.append("vs_currencies", "usd");
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`
      )
        .then((res) => {
          clearTimeout(timeoutId);
          return res.json();
        })
        .then((data) => {
          const price = data[network.value!.coingeckoID!]["usd"];
          const txPrice = new BigNumber(price)
            .times(fee.value.nativeValue!)
            .toString();
          fee.value.fiatValue = txPrice;
        })
        .catch(() => {
          console.error("Could not fetch token price");
        });
    }
  }
});

watch(pickedTrade, () => {
  if (Tx.value) {
    setTransactionFees(Tx.value);
  }
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
    warning.value === undefined ||
    warning.value === SwapBestOfferWarnings.EXISTENTIAL_DEPOSIT ||
    warning.value === SwapBestOfferWarnings.NOT_ENOUGH_GAS ||
    (gasCostValues.value[selectedFee.value].nativeValue === "0" &&
      fee.value.nativeValue === "0")
  ) {
    return true;
  }
  return false;
});

const sendAction = async () => {
  if (pickedTrade.value) {
    isTXSendError.value = false;
    TXSendErrorMessage.value = "";
    isTXSendLoading.value = true;
    isInitiated.value = true;
    await swap
      .executeTrade(
        network.value!,
        account.value!,
        pickedTrade.value,
        selectedFee.value
      )
      .catch((err) => {
        isTXSendError.value = true;
        TXSendErrorMessage.value = err.error.message;
      });
    isTXSendLoading.value = false;
  } else {
    console.log("No trade yet");
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

  return false;
};
const toggleSelectFee = () => {
  isOpenSelectFee.value = !isOpenSelectFee.value;
};

const selectFee = (option: GasPriceTypes) => {
  selectedFee.value = option;
  isOpenSelectFee.value = false;
};

const setTransactionFees = async (txs: Transaction[]) => {
  const gasPromises = txs.map((tx) => {
    return tx.getGasCosts().then(async (gasvals) => {
      const getConvertedVal = (type: GasPriceTypes) =>
        fromBase(gasvals[type], network.value!.decimals);

      nativeTokenPrice.value = (
        await network.value!.getAllTokens(account.value!.address)
      )[0].price;
      return {
        [GasPriceTypes.ECONOMY]: {
          nativeValue: getConvertedVal(GasPriceTypes.ECONOMY),
          fiatValue: new BigNumber(
            getConvertedVal(GasPriceTypes.ECONOMY)
          ).times(nativeTokenPrice.value!),
        },
        [GasPriceTypes.REGULAR]: {
          nativeValue: getConvertedVal(GasPriceTypes.REGULAR),
          fiatValue: new BigNumber(
            getConvertedVal(GasPriceTypes.REGULAR)
          ).times(nativeTokenPrice.value!),
        },
        [GasPriceTypes.FAST]: {
          nativeValue: getConvertedVal(GasPriceTypes.FAST),
          fiatValue: new BigNumber(getConvertedVal(GasPriceTypes.FAST)).times(
            nativeTokenPrice.value!
          ),
        },
        [GasPriceTypes.FASTEST]: {
          nativeValue: getConvertedVal(GasPriceTypes.FASTEST),
          fiatValue: new BigNumber(
            getConvertedVal(GasPriceTypes.FASTEST)
          ).times(nativeTokenPrice.value!),
        },
      };
    });
  });

  const gasVals = await Promise.all(gasPromises);

  const finalVal = gasVals.reduce((prev, curr) => {
    if (!prev) return curr;

    return {
      [GasPriceTypes.ECONOMY]: {
        nativeValue: new BigNumber(prev[GasPriceTypes.ECONOMY].nativeValue)
          .plus(curr[GasPriceTypes.ECONOMY].nativeValue)
          .toString(),
        fiatValue: prev[GasPriceTypes.ECONOMY].fiatValue.plus(
          curr[GasPriceTypes.ECONOMY].fiatValue
        ),
      },
      [GasPriceTypes.REGULAR]: {
        nativeValue: new BigNumber(prev[GasPriceTypes.REGULAR].nativeValue)
          .plus(curr[GasPriceTypes.REGULAR].nativeValue)
          .toString(),
        fiatValue: prev[GasPriceTypes.REGULAR].fiatValue.plus(
          curr[GasPriceTypes.REGULAR].fiatValue
        ),
      },
      [GasPriceTypes.FAST]: {
        nativeValue: new BigNumber(prev[GasPriceTypes.FAST].nativeValue)
          .plus(curr[GasPriceTypes.FAST].nativeValue)
          .toString(),
        fiatValue: prev[GasPriceTypes.FAST].fiatValue.plus(
          curr[GasPriceTypes.FAST].fiatValue
        ),
      },
      [GasPriceTypes.FASTEST]: {
        nativeValue: new BigNumber(prev[GasPriceTypes.FASTEST].nativeValue)
          .plus(curr[GasPriceTypes.FASTEST].nativeValue)
          .toString(),
        fiatValue: prev[GasPriceTypes.FASTEST].fiatValue.plus(
          curr[GasPriceTypes.FASTEST].fiatValue
        ),
      },
    };
  });

  gasCostValues.value = {
    [GasPriceTypes.ECONOMY]: {
      nativeValue: finalVal[GasPriceTypes.ECONOMY].nativeValue,
      fiatValue: finalVal[GasPriceTypes.ECONOMY].fiatValue.toString(),
      nativeSymbol: network.value!.currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.REGULAR]: {
      nativeValue: finalVal[GasPriceTypes.REGULAR].nativeValue,
      fiatValue: finalVal[GasPriceTypes.REGULAR].fiatValue.toString(),
      nativeSymbol: network.value!.currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.FAST]: {
      nativeValue: finalVal[GasPriceTypes.FAST].nativeValue,
      fiatValue: finalVal[GasPriceTypes.FAST].fiatValue.toString(),
      nativeSymbol: network.value!.currencyName,
      fiatSymbol: "USD",
    },
    [GasPriceTypes.FASTEST]: {
      nativeValue: finalVal[GasPriceTypes.FASTEST].nativeValue,
      fiatValue: finalVal[GasPriceTypes.FASTEST].fiatValue.toString(),
      nativeSymbol: network.value!.currencyName,
      fiatSymbol: "USD",
    },
  };
};

const selectTrade = (trade: TradeInfo) => {
  pickedTrade.value = trade;
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
