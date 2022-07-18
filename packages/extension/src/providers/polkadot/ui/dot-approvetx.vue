<template>
  <div id="app">
    <h1>Polkadot Transaction Approve</h1>
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <div class="navbar-nav mr-auto">
        Domain: {{ Options.domain }} would like to send a transaction
      </div>
      <button @click="approve">approve</button>
      <button @click="deny">deny</button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { onBeforeMount, ref } from "vue";
import { ProviderRequestOptions } from "@/types/provider";
import { EnkryptAccount } from "@enkryptcom/types";

const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
});

const windowPromise = WindowPromiseHandler(0);

onBeforeMount(async () => {
  const { options } = await windowPromise;
  Options.value = options;
});

const approve = async () => {
  const { Request, Resolve, sendToBackground } = await windowPromise;
  const msg = Request.value.params![0] as `0x{string}`;
  const account = Request.value.params![1] as EnkryptAccount;
  sendToBackground({
    method: InternalMethods.sign,
    params: [msg, account],
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
