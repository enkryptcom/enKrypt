<template>
  <div class="provider-verify-transaction">
    <sign-logo
      color="#E6007A"
      class="provider-verify-transaction__logo"
    ></sign-logo>
    <div class="provider-verify-transaction__network">
      <img src="@/ui/action/icons/raw/polkadot.png" />
      <p>Polkadot</p>
    </div>
    <h2>Verify transaction</h2>

    <custom-scrollbar
      ref="providerVerifyTransactionScrollRef"
      class="provider-verify-transaction__scroll-area"
      :settings="ScrollSettings"
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
          <img src="@/ui/action/icons/raw/polkadot.png" />
          <div class="provider-verify-transaction__info-info">
            <h4>Polkadot</h4>
            <p>
              https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.polkadot.io#/explorer
            </p>
          </div>
        </div>

        <div class="provider-verify-transaction__amount">
          <img src="@/ui/action/icons/raw/polkadot.png" />

          <div class="provider-verify-transaction__amount-info">
            <h4>1.56 <span>dot</span></h4>
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
        <base-button title="Decline" :click="deny" :no-background="true" />
      </div>
      <div class="provider-verify-transaction__buttons-send">
        <base-button title="Sign" :click="approve" />
      </div>
    </div>
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
import ScrollSettings from "@/libs/utils/scroll-settings";
import { KeyRecord } from "@enkryptcom/types";
import { getCustomError, getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
const { PromiseResolve, Request, sendToBackground } = WindowPromiseHandler();

let isOpenSelectFee = ref(false);
let fee = ref(recommendedFee);
const providerVerifyTransactionScrollRef = ref(null);
let isOpenData = ref(false);

defineExpose({ providerVerifyTransactionScrollRef });

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
    ).classList.contains("ps--active-y");
  }

  return false;
};
const toggleData = () => {
  isOpenData.value = !isOpenData.value;
};
const approve = () => {
  if (!Request.value.params || Request.value.params.length < 2) {
    return PromiseResolve.value({ error: getCustomError("No params") });
  }
  const msg = Request.value.params[0] as `0x{string}`;
  const account = Request.value.params[1] as KeyRecord;
  sendToBackground({
    method: InternalMethods.sign,
    params: [msg, account],
  }).then((res) => {
    if (res.error) {
      PromiseResolve.value(res);
    } else {
      PromiseResolve.value({
        result: JSON.stringify(res.result),
      });
    }
  });
};
const deny = () => {
  PromiseResolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "./styles/verify-transaction.less";
</style>
