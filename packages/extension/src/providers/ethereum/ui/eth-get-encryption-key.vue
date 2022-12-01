<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
    </template>

    <template #content>
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
            <h4>{{ Options.domain }}</h4>
          </div>
        </div>

        <p class="common-popup__message">
          {{ Options.domain }} would like to access the encryption public key
        </p>
      </div>
    </template>

    <template #button-left>
      <base-button title="Cancel" :click="deny" :no-background="true" />
    </template>

    <template #button-right>
      <base-button title="Provide" :click="approve" />
    </template>
  </common-popup>
</template>

<script setup lang="ts">
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import CommonPopup from "@action/views/common-popup/index.vue";
import { getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { onBeforeMount, ref } from "vue";
import { DEFAULT_EVM_NETWORK, getNetworkByName } from "@/libs/utils/networks";
import { EvmNetwork } from "../types/evm-network";
import { ProviderRequestOptions } from "@/types/provider";
import { EnkryptAccount } from "@enkryptcom/types";
const windowPromise = WindowPromiseHandler(2);
const network = ref<EvmNetwork>(DEFAULT_EVM_NETWORK);
const account = ref<EnkryptAccount>({
  name: "",
  address: "",
} as EnkryptAccount);
const identicon = ref<string>("");
const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
  tabId: 0,
});
onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  network.value = (await getNetworkByName(
    Request.value.params![1]
  )) as EvmNetwork;
  account.value = Request.value.params![0] as EnkryptAccount;
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
