<template>
  <common-popup>
    <template #header>
      <sign-logo color="#05C0A5" class="common-popup__logo"></sign-logo>
    </template>

    <template #content>
      <h2>Sign Typed Data</h2>

      <div class="common-popup__block">
        <div class="common-popup__account">
          <img :src="identicon" />
          <div class="common-popup__account-info">
            <h4>{{ account.name }}</h4>
            <p>
              {{ $filters.replaceWithEllipsis(account.address, 6, 4) }}
            </p>
          </div>
        </div>
      </div>
      <div class="common-popup__block">
        <div class="common-popup__info">
          <img :src="options.faviconURL" />
          <div class="common-popup__info-info">
            <h4>{{ options.title }}</h4>
            <p>{{ options.domain }}</p>
          </div>
        </div>

        <div class="common-popup__message">
          {{ message }}
        </div>
      </div>
    </template>

    <template #button-left>
      <base-button title="Cancel" :click="deny" :no-background="true" />
    </template>

    <template #button-right>
      <base-button title="Sign" :click="approve" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { KeyRecord } from "@enkryptcom/types";
import { getCustomError, getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { computed } from "vue";
import { DEFAULT_NETWORK_NAME, getNetworkByName } from "@/libs/utils/networks";
import { NodeType } from "@/types/provider";
import {
  typedSignatureHash,
  TypedDataUtils,
  SignTypedDataVersion,
} from "@metamask/eth-sig-util";
import { bufferToHex } from "@enkryptcom/utils";

const PARAMS_LENGTH = 4;
const { PromiseResolve, options, Request, sendToBackground } =
  WindowPromiseHandler();
const message = computed(() => {
  if (Request.value.params && Request.value.params.length == PARAMS_LENGTH) {
    try {
      return JSON.stringify(JSON.parse(Request.value.params[0]), null, 2);
    } catch (e) {
      return JSON.stringify(Request.value.params[0], null, 2);
    }
  }
  return "";
});
const network = computed(() => {
  if (Request.value.params && Request.value.params.length == PARAMS_LENGTH)
    return getNetworkByName(Request.value.params[3]) as NodeType;
  else return getNetworkByName(DEFAULT_NETWORK_NAME) as NodeType;
});
const account = computed(() => {
  if (Request.value.params && Request.value.params.length == PARAMS_LENGTH) {
    return Request.value.params[1] as KeyRecord;
  } else
    return {
      name: "",
      address: "",
    } as KeyRecord;
});
const identicon = computed(() => {
  return network.value.identicon(account.value.address);
});
const approve = () => {
  if (!Request.value.params || Request.value.params.length < PARAMS_LENGTH) {
    return PromiseResolve.value({ error: getCustomError("No params") });
  }
  const version = Request.value.params[2] as SignTypedDataVersion;
  const typedData =
    version !== "V1"
      ? JSON.parse(Request.value.params[0])
      : Request.value.params[0];
  let msgHash;
  try {
    if (version === SignTypedDataVersion.V1) {
      msgHash = typedSignatureHash(typedData);
    } else {
      msgHash = bufferToHex(TypedDataUtils.eip712Hash(typedData, version));
    }
  } catch (e: any) {
    PromiseResolve.value({
      error: getCustomError(e.message),
    });
  }
  const account = Request.value.params[1] as KeyRecord;
  sendToBackground({
    method: InternalMethods.sign,
    params: [msgHash, account],
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

<style lang="less" scoped>
@import "~@/providers/ethereum/ui/styles/common-popup.less";
</style>
