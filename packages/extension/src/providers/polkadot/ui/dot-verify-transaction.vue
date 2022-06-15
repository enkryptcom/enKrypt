<template>
  <div class="provider-verify-transaction">
    <sign-logo
      color="#E6007A"
      class="provider-verify-transaction__logo"
    ></sign-logo>
    <div class="provider-verify-transaction__network">
      <img
        :src="network ? network.icon : '@/ui/action/icons/raw/polkadot.png'"
      />
      <p>{{ network ? network.name_long : "" }}</p>
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
            <h4>{{ typeof account === "string" ? account : account?.name }}</h4>
            <div>
              <p>12.34 <span>dot</span></p>
              <p>
                {{
                  typeof account !== "string"
                    ? $filters.replaceWithEllipsis(account?.address, 4, 4)
                    : ""
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="provider-verify-transaction__block">
        <div class="provider-verify-transaction__info">
          <img
            :src="network ? network.icon : '@/ui/action/icons/raw/polkadot.png'"
          />
          <div class="provider-verify-transaction__info-info">
            <h4>{{ network ? network.name_long : "Loading.." }}</h4>
            <p>
              {{ options.url }}
            </p>
          </div>
        </div>
      </div>

      <component :is="txView" v-bind="props" />

      <p>Fee: {{ txFee }}</p>

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
import TransactionFeeView from "@action/views/transaction-fee/index.vue";
import { TransactionFee } from "@action/types/fee";
import { recommendedFee } from "@action/types/mock";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import BestOfferError from "@action/views/swap-best-offer/components/swap-best-offer-block/components/best-offer-error.vue";

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
import { getAllNetworks } from "@/libs/utils/networks";
import { SubstrateNetwork } from "../types/substrate-network";
import { BaseNetwork } from "@/types/base-network";
import BlindVerifyView from "./custom-views/blind-approvetx.vue";
import { polkadotEncodeAddress } from "@enkryptcom/utils";
import { getViewAndProps } from "./custom-views";
import PublicKeyRing from "@/libs/keyring/public-keyring";
import SubstrateAPI from "../libs/api";
import BigNumber from "bignumber.js";

const { PromiseResolve, options, Request, sendToBackground } =
  WindowPromiseHandler();

const isOpenSelectFee = ref(false);
const fee = ref(recommendedFee);
const providerVerifyTransactionScrollRef = ref(null);
const isOpenData = ref(false);
const callData = reactive<CallData>({});
const network = ref<BaseNetwork | undefined>();
const txView = ref<any>(BlindVerifyView);
const account = ref<KeyRecord | string>();
const txFee = ref<string>("Loading");

const metadataStorage = new MetadataStorage();

const props = ref({});

const keyring = new PublicKeyRing();

watch(Request, async () => {
  if (Request.value.params && Request.value.params.length >= 2) {
    const reqPayload = Request.value.params[0] as SignerPayloadJSON;
    const targetNetwork = getAllNetworks().find(
      (network) =>
        (network as SubstrateNetwork).genesisHash === reqPayload.genesisHash
    );

    if (targetNetwork) {
      network.value = targetNetwork;
      const address = reqPayload.address;
      const savedAccount = await keyring.getAccount(
        polkadotEncodeAddress(address, 42)
      );

      if (savedAccount) {
        savedAccount.address = polkadotEncodeAddress(
          savedAccount.address,
          (targetNetwork as SubstrateNetwork).prefix
        );
        account.value = savedAccount;
      } else {
        account.value = address;
      }
    }

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

      if (targetNetwork) {
        const fullMethod = `${data.section}.${data.method}`;
        const [view, viewProps] = getViewAndProps(
          targetNetwork as SubstrateNetwork,
          fullMethod,
          data.args
        );

        props.value = viewProps;
        txView.value = view;

        const extrinsic = registry.createType("Extrinsic", reqPayload, {
          version: reqPayload.version,
        });

        (targetNetwork.api() as Promise<SubstrateAPI>).then((api) => {
          api.api
            .tx(extrinsic)
            .paymentInfo(reqPayload.address, { era: 0 })
            .then((info) => {
              const { partialFee } = info.toJSON();
              const feeHuman = new BigNumber(partialFee as string | number)
                .div(new BigNumber(10 ** targetNetwork.decimals))
                .toString();

              txFee.value = `${feeHuman} ${targetNetwork.name}`;
            });
        });
      } else {
        txFee.value = "N/A";
      }
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
