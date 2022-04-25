<template>
  <div id="app">
    <h1>Unlock Keyring Request</h1>
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <div class="navbar-nav mr-auto">
        Domain: {{ options.domain }} would like to unlock keyring
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
import { ref } from "vue";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
const { PromiseResolve, options, sendToBackground } = WindowPromiseHandler();
let password = ref("");
let errorMsg = ref("");
sendToBackground({
  method: InternalMethods.isLocked,
}).then((res) => {
  const isLocked = res.result as unknown as boolean;
  if (isLocked === false) {
    PromiseResolve.value({
      result: JSON.stringify(res.result),
    });
  }
});
const approve = () => {
  sendToBackground({
    method: InternalMethods.unlock,
    params: [password.value],
  }).then((res) => {
    if (res.error) {
      errorMsg.value = res.error.message;
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
