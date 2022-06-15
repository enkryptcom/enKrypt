<template>
  <div id="app">
    <h1>Unlock Keyring Request</h1>
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <div class="navbar-nav mr-auto">
        Domain: {{ Options.domain }} would like to unlock keyring
      </div>
      <div>
        <input v-model="password" autocomplete="off" />
        <br />
        {{ errorMsg }}
      </div>
      <button @click="approve">approve</button>
      <button @click="deny">deny</button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { onBeforeMount, ref } from "vue";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { ProviderRequestOptions } from "@/types/provider";
const windowPromise = WindowPromiseHandler(0);
const password = ref("");
const errorMsg = ref("");
const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
});
onBeforeMount(async () => {
  const { options } = await windowPromise;
  Options.value = options;
});
const approve = async () => {
  const { sendToBackground, Resolve } = await windowPromise;
  sendToBackground({
    method: InternalMethods.unlock,
    params: [password.value],
  }).then((res) => {
    if (res.error) {
      errorMsg.value = res.error.message;
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
