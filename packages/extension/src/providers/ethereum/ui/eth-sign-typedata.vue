<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
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
          <img :src="Options.faviconURL" />
          <div class="common-popup__info-info">
            <h4>{{ Options.domain }}</h4>
          </div>
        </div>
        <div class="common-popup__message">
          <JsonTreeView v-if="message !== ''" :data="message" :max-depth="1" />
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
import { JsonTreeView } from "@/libs/json-tree-view";
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import CommonPopup from "@action/views/common-popup/index.vue";
import { getCustomError, getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { onMounted, ref } from "vue";
import { DEFAULT_EVM_NETWORK, getNetworkByName } from "@/libs/utils/networks";
import { ProviderRequestOptions } from "@/types/provider";
import {
  typedSignatureHash,
  TypedDataUtils,
  SignTypedDataVersion,
} from "@metamask/eth-sig-util";
import { sanitizeData } from "@/providers/ethereum/libs/sanitize-typed-data";
import { bufferToHex } from "@enkryptcom/utils";
import { EvmNetwork } from "../types/evm-network";
import { EnkryptAccount } from "@enkryptcom/types";

const network = ref<EvmNetwork>(DEFAULT_EVM_NETWORK);
const account = ref<EnkryptAccount>({
  name: "",
  address: "",
} as EnkryptAccount);
const identicon = ref<string>("");
const windowPromise = WindowPromiseHandler(4);
const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
  tabId: 0,
});
const message = ref<string>("");
onMounted(async () => {
  const { Request, options } = await windowPromise;
  network.value = (await getNetworkByName(
    Request.value.params![3]
  )) as EvmNetwork;
  account.value = Request.value.params![1] as EnkryptAccount;
  identicon.value = network.value.identicon(account.value.address);
  Options.value = options;
  try {
    const version = Request.value.params![2] as SignTypedDataVersion;
    if (version === SignTypedDataVersion.V1) {
      message.value = JSON.stringify(Request.value.params![0]);
    } else {
      let parsedJSON = Request.value.params![0];
      if (typeof parsedJSON === "string") parsedJSON = JSON.parse(parsedJSON);
      const sanitized = sanitizeData(parsedJSON, version);
      message.value = JSON.stringify(sanitized);
    }
  } catch (e) {
    console.error(e);
  }
});

const approve = async () => {
  const { Request, Resolve, sendToBackground } = await windowPromise;
  const version = Request.value.params![2] as SignTypedDataVersion;
  const typedData = Request.value.params![0];
  let msgHash;
  try {
    if (version === SignTypedDataVersion.V1) {
      msgHash = typedSignatureHash(typedData);
    } else {
      msgHash = bufferToHex(TypedDataUtils.eip712Hash(typedData, version));
    }
  } catch (e: any) {
    Resolve.value({
      error: getCustomError(e.message),
    });
  }
  sendToBackground({
    method: InternalMethods.sign,
    params: [msgHash, account.value],
  }).then((res) => {
    if (res.error) {
      Resolve.value(res);
    } else {
      Resolve.value({
        result: JSON.stringify(res.result),
      });
    }
  });
};
const deny = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>

<style lang="less" scoped>
@import "~@/providers/ethereum/ui/styles/common-popup.less";
</style>
