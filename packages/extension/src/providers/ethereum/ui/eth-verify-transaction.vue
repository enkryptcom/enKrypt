<template>
  <div class="provider-verify-transaction">
    <sign-logo
      color="#05C0A5"
      class="provider-verify-transaction__logo"
    ></sign-logo>
    <div class="provider-verify-transaction__network">
      <img src="@/ui/action/icons/raw/eth-green.png" />
      <p>Ethereum</p>
    </div>
    <h2>Verify transaction</h2>

    <custom-scrollbar
      ref="providerVerifyTransactionScrollRef"
      class="provider-verify-transaction__scroll-area"
      :settings="settings"
    >
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__account">
          <img src="@/ui/action/icons/raw/account.png" />
          <div class="provider-verify-transaction__account-info">
            <h4>My account nickname</h4>
            <div>
              <p>12.34 <span>dot</span></p>
              <p>
                {{
                  $filters.replaceWithEllipsis(
                    "0x14502CF6C0A13167Dc340E25Dabf5FBDB68R5967",
                    6,
                    4
                  )
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__info">
          <img src="@/ui/action/icons/raw/matchchain.png" />
          <div class="provider-verify-transaction__info-info">
            <h4>Mathchain</h4>
            <p>https://explorer-galois.mathchain.org/#/</p>
          </div>
        </div>

        <div class="provider-verify-transaction__amount">
          <img src="@/ui/action/icons/raw/eth-logo.png" />

          <div class="provider-verify-transaction__amount-info">
            <h4>1.56 <span>eth</span></h4>
            <p>$4520.54</p>
          </div>
        </div>

        <div class="provider-verify-transaction__error">
          <alert-icon />
          <p>
            Warning: you will allow this DApp to spend any amount of ETH at any
            time in the future. Please proceed only if you are trust this DApp.
          </p>
        </div>
      </div>

      <send-fee-select
        :fee="fee"
        :toggle-select="toggleSelectFee"
        :in-swap="true"
      ></send-fee-select>

      <best-offer-error :not-enought-verify="true"></best-offer-error>

      <div class="provider-verify-transaction__data">
        <a
          class="provider-verify-transaction__data-link"
          :class="{ open: isOpenData }"
          @click="toggleData"
          ><span>Show data</span> <right-chevron
        /></a>

        <div v-show="isOpenData" class="provider-verify-transaction__data-text">
          <p>Function type: Register Proxy 0xddd81f82</p>
          <p>Parameters: []</p>
          <p>HEX data: 4 BYTES</p>
          <p>0xddd81f82</p>
          <p>Verified contract on <a href="#">Etherscan</a></p>
          <p>Decoded by Truffle</p>
        </div>
      </div>
    </custom-scrollbar>

    <transaction-fee-view
      :show-fees="isOpenSelectFee"
      :close="toggleSelectFee"
      :select-fee="selectFee"
      :selected="fee.price.speed"
      :is-header="true"
    ></transaction-fee-view>

    <div
      class="provider-verify-transaction__buttons"
      :class="{ border: isHasScroll() }"
    >
      <div class="provider-verify-transaction__buttons-cancel">
        <base-button
          title="Decline"
          :click="cancelAction"
          :no-background="true"
        />
      </div>
      <div class="provider-verify-transaction__buttons-send">
        <base-button title="Sign" :click="signAction" />
      </div>
    </div>

    <modal-sign
      v-if="isOpenSign"
      :close="toggleSign"
      :forgot="toggleForgot"
      :unlock="unlockAction"
    ></modal-sign>

    <modal-forgot
      v-if="isForgot"
      :is-forgot="isForgot"
      :toggle-forgot="toggleForgot"
      :reset-action="resetAction"
    ></modal-forgot>

    <modal-preload v-show="isProcessing"></modal-preload>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SignLogo from "@action/icons/common/sign-logo.vue";
import RightChevron from "@action/icons/common/right-chevron.vue";
import BaseButton from "@action/components/base-button/index.vue";
import SendFeeSelect from "@action/views/send-transaction/components/send-fee-select.vue";
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
import { TransactionFee } from "@action/types/fee";
import { recommendedFee } from "@action/types/mock";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import BestOfferError from "@action/views/swap-best-offer/components/swap-best-offer-block/components/best-offer-error.vue";
import AlertIcon from "@action/icons/send/alert-icon.vue";
import ModalSign from "@action/views/modal-sign/index.vue";
import ModalForgot from "@action/views/modal-forgot/index.vue";
import ModalPreload from "@action/views/modal-preload/index.vue";

let isOpenSelectFee = ref(false);
let fee = ref(recommendedFee);
const providerVerifyTransactionScrollRef = ref(null);
let isOpenData = ref(false);
let isOpenSign = ref(false);
let isForgot = ref(false);
let isProcessing = ref(false);

defineExpose({ providerVerifyTransactionScrollRef });

const cancelAction = () => {
  console.log("cancelAction");
};
const signAction = () => {
  toggleSign();
};
const toggleSelectFee = (open: boolean) => {
  isOpenSelectFee.value = open;
};
const selectFee = (option: TransactionFee) => {
  fee.value = option;
  isOpenSelectFee.value = false;
};
const isHasScroll = () => {
  if (providerVerifyTransactionScrollRef.value) {
    return (
      providerVerifyTransactionScrollRef.value as HTMLElement
    ).$el.classList.contains("ps--active-y");
  }

  return false;
};
const toggleData = () => {
  isOpenData.value = !isOpenData.value;
};
const toggleSign = () => {
  isOpenSign.value = !isOpenSign.value;
};
const toggleForgot = () => {
  isOpenSign.value = false;
  isForgot.value = !isForgot.value;
};
const resetAction = () => {
  console.log("resetAction");
};
const unlockAction = () => {
  isProcessing.value = !isProcessing.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "~@action/styles/provider-verify-transaction.less";
</style>
