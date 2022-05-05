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
          :settings="settings"
          :style="{ maxHeight: height + 'px' }"
          @ps-scroll-y="handleScroll"
        >
          <swap-best-offer-block></swap-best-offer-block>
          <best-offer-error :not-enought-e-t-h="true"></best-offer-error>
          <send-fee-select
            :fee="fee"
            :toggle-select="toggleSelectFee"
            :in-swap="true"
          ></send-fee-select>
        </custom-scrollbar>

        <transaction-fee-view
          :show-fees="isOpenSelectFee"
          :close="toggleSelectFee"
          :select-fee="selectFee"
          :selected="fee.price.speed"
        ></transaction-fee-view>
      </div>

      <div class="swap-best-offer__buttons" :class="{ border: isHasScroll() }">
        <div class="swap-best-offer__buttons-cancel">
          <base-button title="Back" :click="back" :gray="true" />
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
import { defineProps, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import SwapBestOfferBlock from "./components/swap-best-offer-block/index.vue";
import SwapInitiated from "@action/views/swap-initiated/index.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import BestOfferError from "./components/swap-best-offer-block/components/best-offer-error.vue";
import SendFeeSelect from "@action/views/send-transaction/components/send-fee-select.vue";
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
import { TransactionFee } from "@action/types/fee";
import { recommendedFee } from "@action/types/mock";

const router = useRouter();
const route = useRoute();

let isInitiated = ref(false);
const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};
const bestOfferScrollRef = ref(null);
let scrollProgress = ref(0);
let height = ref(460);
const selected: string = route.params.id as string;
let isOpenSelectFee = ref(false);
let fee = ref(recommendedFee);

defineExpose({ bestOfferScrollRef });
const back = () => {
  router.go(-1);
};

const close = () => {
  router.go(-2);
};

defineProps({});

const sendButtonTitle = () => {
  let title = "Proceed with swap";

  return title;
};
const isDisabled = () => {
  let isDisabled = false;

  return isDisabled;
};
const sendAction = () => {
  toggleInitiated();
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
    return (bestOfferScrollRef.value as HTMLElement).$el.classList.contains(
      "ps--active-y"
    );
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
