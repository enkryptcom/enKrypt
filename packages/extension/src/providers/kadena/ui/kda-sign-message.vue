<template>
  <common-popup>
    <template #header>
      <sign-logo class="common-popup__logo" />
    </template>

    <template #content>
      <h2>Sign message</h2>

      <div class="common-popup__block">
        <div class="common-popup__account">
          <img :src="networks.polkadot.identicon(account.address)" />
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
          {{ message }}
        </p>
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
import CommonPopup from "@action/views/common-popup/index.vue";
import { getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { onBeforeMount, ref } from "vue";
import { isUtf8, u8aToString, u8aUnwrapBytes } from "@polkadot/util";
import networks from "../networks";
import { ProviderRequestOptions } from "@/types/provider";
import { EnkryptAccount } from "@enkryptcom/types";
import { MessageSigner } from "./libs/signer";
import { hexToBuffer } from "@enkryptcom/utils";

const windowPromise = WindowPromiseHandler(0);

const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
  tabId: 0,
});
const message = ref("");
const account = ref({ address: "" } as EnkryptAccount);

onBeforeMount(async () => {
  const { Request, options } = await windowPromise;
  Options.value = options;

  message.value = isUtf8(Request.value.params![0])
    ? u8aToString(u8aUnwrapBytes(Request.value.params![0]))
    : Request.value.params![0];

  account.value = Request.value.params![1] as EnkryptAccount;
});

const approve = async () => {
  const { Request, Resolve } = await windowPromise;

  const msg = Request.value.params![0] as `0x{string}`;
  const account = Request.value.params![1] as EnkryptAccount;
  MessageSigner({
    account,
    payload: hexToBuffer(msg),
  })
    .then(Resolve.value)
    .catch(Resolve.value);
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
