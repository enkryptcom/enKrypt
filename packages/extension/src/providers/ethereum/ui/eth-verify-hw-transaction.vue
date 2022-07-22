<template>
  <common-popup>
    <template #header>
      <sign-logo color="#05C0A5" class="common-popup__logo"></sign-logo>
      <div class="common-popup__network">
        <img src="@/ui/action/icons/raw/eth-logo.png" />
        <p>Ethereum</p>
      </div>
    </template>

    <template #content>
      <h2>Verify transaction</h2>

      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__hw">
          <trezor-icon />
          <p>
            Before confirming the transaction plug in your Trezor and follow the
            further instructions.
          </p>
        </div>
      </div>

      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__hw">
          <ladger-icon />
          <p>
            Before confirming the transaction plug in your Ledger, select the
            right app and follow the further instructions.
          </p>
        </div>
      </div>

      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__account from">
          <img src="@/ui/action/icons/raw/account.png" />
          <div class="provider-verify-transaction__account-info">
            <h6>From</h6>
            <h4>My personal account</h4>
            <div>
              <p>12.34 <span>ETH</span></p>
              <p>
                {{
                  $filters.replaceWithEllipsis(
                    "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",
                    4,
                    4
                  )
                }}
              </p>
            </div>
          </div>
        </div>

        <div class="provider-verify-transaction__account">
          <img src="@/ui/action/icons/raw/account.png" />
          <div class="provider-verify-transaction__account-info">
            <h6>To</h6>
            <div class="provider-verify-transaction__account-info-to">
              0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e
            </div>
          </div>
        </div>
      </div>

      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__amount">
          <img src="@/ui/action/icons/raw/eth-logo.png" />

          <div class="provider-verify-transaction__amount-info">
            <h4>1.56 <span>eth</span></h4>
            <p>$4520.54</p>
          </div>
        </div>
      </div>

      <div class="provider-verify-transaction__fee">
        <div class="provider-verify-transaction__fee-value">
          <p class="provider-verify-transaction__fee-value-fiat">Fee: $13.56</p>
          <p class="provider-verify-transaction__fee-value-crypto">
            0.0019
            <span>ETH</span>
          </p>
        </div>
      </div>

      <div class="provider-verify-transaction__data">
        <a
          class="provider-verify-transaction__data-link"
          :class="{ open: isOpenData }"
          @click="toggleData"
          ><span>Show data</span> <right-chevron
        /></a>

        <div v-show="isOpenData" class="provider-verify-transaction__data-text">
          <div>
            <p>Call: Call</p>
            <p>Parameters:</p>
            <li>Function type: Register Proxy 0xddd81f82</li>
            <li>HEX data: 4 BYTES</li>
          </div>
        </div>
      </div>
    </template>

    <template #button-left>
      <base-button title="Decline" :click="deny" :no-background="true" />
    </template>

    <template #button-right>
      <base-button title="Sign" :click="approve" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SignLogo from "@action/icons/common/sign-logo.vue";
import CommonPopup from "@action/views/common-popup/index.vue";
import RightChevron from "@action/icons/common/right-chevron.vue";
import TrezorIcon from "@action/icons/hardware/trezor-icon.vue";
import LadgerIcon from "@action/icons/hardware/ladger-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";

const providerVerifyTransactionScrollRef = ref(null);
const isOpenData = ref(false);

defineExpose({ providerVerifyTransactionScrollRef });

const toggleData = () => {
  isOpenData.value = !isOpenData.value;
};

const approve = () => {
  console.log("approve");
};
const deny = async () => {
  console.log("approve");
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "~@/providers/ethereum/ui/styles/common-popup.less";
@import "./styles/verify-transaction.less";
</style>
