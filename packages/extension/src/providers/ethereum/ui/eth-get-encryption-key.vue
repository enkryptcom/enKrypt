<template>
  <div class="common-popup">
    <sign-logo color="#05C0A5" class="common-popup__logo"></sign-logo>
    <h2>Get Encryption Key</h2>

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
          <h4>{{ Options.title }}</h4>
          <p>{{ Options.domain }}</p>
        </div>
      </div>

      <p class="common-popup__message">
        {{ Options.domain }} would like to access the encryption public key
      </p>
    </div>
    <div class="common-popup__buttons">
      <div class="common-popup__buttons-cancel">
        <base-button title="Cancel" :click="deny" :no-background="true" />
      </div>
      <div class="common-popup__buttons-send">
        <base-button title="Provide" :click="approve" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { KeyRecord } from "@enkryptcom/types";
import { getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { onBeforeMount, ref } from "vue";
import { DEFAULT_NETWORK_NAME, getNetworkByName } from "@/libs/utils/networks";
import { EvmNetwork } from "../types/evm-network";
import { ProviderRequestOptions } from "@/types/provider";
const windowPromise = WindowPromiseHandler(2);
const network = ref<EvmNetwork>(
  getNetworkByName(DEFAULT_NETWORK_NAME) as EvmNetwork
);
const account = ref<KeyRecord>({
  name: "",
  address: "",
} as KeyRecord);
const identicon = ref<string>("");
const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
});
onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  network.value = getNetworkByName(Request.value.params![1]) as EvmNetwork;
  account.value = Request.value.params![0] as KeyRecord;
  identicon.value = network.value.identicon(account.value.address);
  Options.value = options;
});
const approve = async () => {
  const { sendToBackground, Resolve } = await windowPromise;
  sendToBackground({
    method: InternalMethods.getEthereumEncryptionPublicKey,
    params: [account.value],
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
