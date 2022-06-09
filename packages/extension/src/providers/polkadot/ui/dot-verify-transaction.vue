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

        <!-- <div class="provider-verify-transaction__error">
          <alert-icon />
          <p>
            Warning: you will allow this DApp to spend any amount of ETH at any
            time in the future. Please proceed only if you are trust this DApp.
          </p>
        </div> -->
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
          <p>
            Call:
            {{
              callData.method
                ? `${callData.section}.${callData.method}`
                : "Loading"
            }}
          </p>
          <p>Parameters:</p>
          <li
            v-for="(item, index) in Object.keys(callData.args ?? {})"
            :key="index"
          >
            {{ `${item}: ${JSON.stringify(callData.args[item])}` }}
          </li>
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
import { reactive, ref, watch } from "vue";
import { base64Decode } from "@polkadot/util-crypto";
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

import { KeyRecord } from "@enkryptcom/types";
import { getCustomError, getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { TypeRegistry, Metadata } from "@polkadot/types";
import { SignerPayloadJSON } from "@polkadot/types/types";
import { signPayload } from "../libs/signing-utils";
import MetadataStorage from "../libs/metadata-storage";
import { CallData } from "./types";

const { PromiseResolve, options, Request, sendToBackground } =
  WindowPromiseHandler();

const isOpenSelectFee = ref(false);
const fee = ref(recommendedFee);
const providerVerifyTransactionScrollRef = ref(null);
const isOpenData = ref(false);
const callData = reactive<CallData>({});

const metadataStorage = new MetadataStorage();

watch(Request, async () => {
  console.log(Request);
  console.log("options", options);
  if (Request.value.params && Request.value.params.length >= 2) {
    const reqPayload = Request.value.params[0] as SignerPayloadJSON;

    const metadata = await metadataStorage.getMetadata(reqPayload.genesisHash);

    if (metadata && metadata.metaCalls) {
      const registry = new TypeRegistry();
      registry.setMetadata(
        new Metadata(registry, base64Decode(metadata.metaCalls))
      );
      registry.setSignedExtensions(reqPayload.signedExtensions);

      let data = registry.createType("Call", reqPayload.method).toHuman();
      callData.method = data.method as string;
      callData.section = data.section as string;
      callData.args = data.args;
    }
  }
});

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

  const registry = new TypeRegistry();
  const reqPayload = Request.value.params[0] as SignerPayloadJSON;
  registry.setSignedExtensions(reqPayload.signedExtensions);
  const extType = registry.createType("ExtrinsicPayload", reqPayload, {
    version: reqPayload.version,
  });
  const signMsg = signPayload(extType);

  const account = Request.value.params[1] as KeyRecord;
  sendToBackground({
    method: InternalMethods.sign,
    params: [signMsg, account],
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
@import "~@action/styles/provider-verify-transaction.less";
</style>
