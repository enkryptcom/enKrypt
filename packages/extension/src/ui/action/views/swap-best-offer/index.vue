<template>
  <div class="container">
    <div v-if="!!selected" class="swap-best-offer">
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
            :quotes="swapData.quotes"
            :picked-quote="pickedQuote"
            :from-token="swapData.fromToken"
            :to-token="swapData.toToken"
            :from-amount="swapData.fromAmount"
            @update:picked-quote="selectQuote"
          >
          </swap-best-offer-block>
          <best-offer-error
            v-if="gasFees?.gt(balance)"
            :not-enought-e-t-h="true"
          ></best-offer-error>
          <send-fee-select
            :fee="undefined"
            :toggle-select="toggleSelectFee"
            :in-swap="true"
          ></send-fee-select>
        </custom-scrollbar>

        <!-- <transaction-fee-view
          :show-fees="isOpenSelectFee"
          :close="toggleSelectFee"
          :select-fee="selectFee"
          :selected="undefined"
          :is-header="true"
        ></transaction-fee-view> -->
      </div>

      <div class="swap-best-offer__buttons" :class="{ border: isHasScroll() }">
        <div class="swap-best-offer__buttons-cancel">
          <base-button title="Back" :click="back" :no-background="true" />
        </div>
        <div class="swap-best-offer__buttons-send">
          <base-button
            :title="sendButtonTitle()"
            :click="sendAction"
            :disabled="isDisabled()"
          />
        </div>
      </div>
    </div>
    <swap-initiated
      v-if="isInitiated"
      :close="toggleInitiated"
    ></swap-initiated>
  </div>
</template>

<script lang="ts">
export default {
  name: "SwapBestOffer",
};
</script>

<script setup lang="ts">
import { ComponentPublicInstance, onMounted, PropType, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import SwapBestOfferBlock from "./components/swap-best-offer-block/index.vue";
import SwapInitiated from "@action/views/swap-initiated/index.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import BestOfferError from "./components/swap-best-offer-block/components/best-offer-error.vue";
import SendFeeSelect from "@/providers/ethereum/ui/send-transaction/components/send-fee-select.vue";
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
import { TransactionFee } from "@action/types/fee";
import { recommendedFee } from "@action/types/mock";
import scrollSettings from "@/libs/utils/scroll-settings";
import { QuoteInfo, Trade } from "@/providers/swap/types/SwapProvider";
import { BaseToken } from "@/types/base-token";
import { Swap } from "@/providers/swap";
import { BaseNetwork } from "@/types/base-network";
import { AccountsHeaderData } from "../../types/account";
import { toBN } from "web3-utils";
import BN from "bn.js";

interface SwapData {
  quotes: QuoteInfo[];
  fromToken: BaseToken;
  toToken: BaseToken;
  fromAmount: string;
  toAddress: string;
}

const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

const router = useRouter();
const route = useRoute();
const swap = new Swap();

const isInitiated = ref(false);
const bestOfferScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
const scrollProgress = ref(0);
const height = ref(460);
const selected: string = route.params.id as string;
const swapData: SwapData = JSON.parse(route.params.swapData as string);
const isOpenSelectFee = ref(false);
const fee = ref(recommendedFee);
const pickedQuote = ref<QuoteInfo>(swapData.quotes[0]);
const trade = ref<Trade | null>(null);
const balance = ref<BN>();
const gasFees = ref<BN>();

defineExpose({ bestOfferScrollRef });

const getTrade = async () => {
  const quote = swapData.quotes[0];
  const trade = await swap.getTrade(
    props.network.name,
    props.accountInfo.selectedAccount!.address,
    swapData.toAddress,
    quote,
    swapData.fromToken,
    swapData.toToken,
    swapData.fromAmount
  );

  return trade;
};

onMounted(async () => {
  const api = await props.network.api();
  await api.init();
  balance.value = toBN(
    await api.getBalance(props.accountInfo.selectedAccount!.address)
  );
});

watch(pickedQuote, async () => {
  const newTrade = await getTrade();

  trade.value = newTrade;
});

watch([trade, balance], async () => {
  if (trade.value && balance.value) {
    gasFees.value = trade.value.transactions
      .map(({ gas }) => toBN(gas))
      .reduce((gasA, gasB) => gasA.add(gasB), toBN(0));
  }
});

const back = () => {
  router.go(-1);
};

const close = () => {
  router.go(-2);
};

const sendButtonTitle = () => {
  let title = "Proceed with swap";

  return title;
};
const isDisabled = () => {
  let isDisabled = false;

  return isDisabled;
};
const sendAction = async () => {
  toggleInitiated();

  if (trade.value) {
    const api = await props.network.api();
    await api.init();
    swap.executeTrade(api, trade.value, {});
  }

  setTimeout(() => {
    console.log("sendAction");
  }, 300);
};
const toggleInitiated = () => {
  isInitiated.value = !isInitiated.value;
};
const handleScroll = (e: any) => {
  let progress = Number(e.target.lastChild.style.top.replace("px", ""));
  scrollProgress.value = progress;
  height.value = 460 + Math.min(12, progress);
};
const isHasScroll = () => {
  if (bestOfferScrollRef.value) {
    return bestOfferScrollRef.value.$el.classList.contains("ps--active-y");
  }

  return false;
};
const toggleSelectFee = (open: boolean) => {
  isOpenSelectFee.value = open;
};

const selectFee = (option: TransactionFee) => {
  fee.value = option;
  isOpenSelectFee.value = false;
};

const selectQuote = (quote: QuoteInfo) => {
  console.log("test");
  pickedQuote.value = quote;
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
