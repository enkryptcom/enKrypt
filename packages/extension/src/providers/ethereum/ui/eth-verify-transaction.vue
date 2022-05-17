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
import { defineExpose, ref } from "vue";
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
.provider-verify-transaction {
  width: 100%;
  height: 100%;
  padding-top: 44px;
  padding-bottom: 76px;
  box-sizing: border-box;
  &__logo {
    margin-bottom: 8px;
  }
  &__network {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    position: absolute;
    right: 56px;
    top: 54px;

    img {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }

    p {
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      text-align: right;
      letter-spacing: 0.5px;
      color: @primaryLabel;
      margin: 0;
    }
  }
  h2 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
  }
  &__block {
    background: @lightBg;
    border: 1px solid @gray01;
    box-sizing: border-box;
    border-radius: 12px;
    padding: 10px 16px;
    width: 100%;
    margin: 0 0 16px 0;
  }
  &__amount {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: row;

    img {
      box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
      width: 32px;
      height: 32px;
      margin-right: 12px;
      border-radius: 100%;
    }

    &-info {
      h4 {
        font-style: normal;
        font-weight: 700;
        font-size: 24px;
        line-height: 32px;
        color: @primaryLabel;
        margin: 0;

        span {
          font-variant: small-caps;
        }
      }

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @secondaryLabel;
        margin: 0;
      }
    }
  }
  &__account {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
      border-radius: 100%;
    }
    &-info {
      h4 {
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
        margin: 0;
      }

      div {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;

        p {
          &:first-child {
            font-style: normal;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
            letter-spacing: 0.5px;
            color: @secondaryLabel;
            margin: 0 8px 0 0;

            span {
              font-variant: small-caps;
            }
          }

          &:last-child {
            font-style: normal;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
            letter-spacing: 0.5px;
            color: @tertiaryLabel;
            margin: 0;
            word-break: break-all;
          }
        }
      }
    }
  }
  &__error {
    margin: 12px 0 0 0;
    border-radius: 10px;
    padding: 0 0 0 44px;
    position: relative;
    box-sizing: border-box;
    svg {
      position: absolute;
      left: 0;
      top: 0;
    }
    p {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @error;
      margin: 0;
      a {
        color: @error;
        &:hover {
          text-decoration: none;
        }
      }
    }
  }
  &__info {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    padding: 6px 0;
    margin-bottom: 6px;
    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }
    &-info {
      h4 {
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
        margin: 0;
      }

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.5px;
        color: @tertiaryLabel;
        margin: 0;
        word-break: break-all;
      }
    }
  }
  &__data {
    text-align: center;
    padding-top: 4px;
    padding-bottom: 20px;
    &-link {
      border-radius: 6px;
      transition: background 300ms ease-in-out;
      display: inline-block;
      cursor: pointer;
      text-decoration: none;
      padding: 4px 24px 4px 8px;
      position: relative;
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.8px;
      color: @primaryLabel;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      svg {
        position: absolute;
        right: 4px;
        top: 4px;
        -moz-transform: rotate(0deg);
        -webkit-transform: rotate(0deg);
        -o-transform: rotate(0deg);
        -ms-transform: rotate(0deg);
        transform: rotate(0deg);
        -webkit-transition: all 0.3s ease-in-out;
        -moz-transition: all 0.3s ease-in-out;
        -ms-transition: all 0.3s ease-in-out;
        -o-transition: all 0.3s ease-in-out;
        transition: all 0.3s ease-in-out;
      }

      &.open {
        svg {
          position: absolute;
          right: 4px;
          top: 4px;
          -moz-transform: rotate(180deg);
          -webkit-transform: rotate(180deg);
          -o-transform: rotate(180deg);
          -ms-transform: rotate(180deg);
          transform: rotate(180deg);
        }
      }
    }

    &-text {
      padding-top: 12px;
      text-align: left;

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.5px;
        color: @secondaryLabel;
        margin: 0;

        a {
          color: @secondaryLabel;
        }
      }
    }
  }
  &__buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    box-sizing: border-box;
    position: absolute;
    left: 0;
    bottom: 0;
    font-size: 0;
    padding: 24px;
    box-sizing: border-box;
    background-color: @white;
    &-cancel {
      width: 172px;
    }
    &-send {
      width: 232px;
    }

    &.border {
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05),
        0px 0px 1px rgba(0, 0, 0, 0.25);
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: calc(~"100% + 16px");
    max-height: 372px;
    margin: 0;
    padding: 0 16px 0 0 !important;
    margin-right: -16px;
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
