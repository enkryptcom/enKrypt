<template>
  <div id="app">
    <h1>Polkadot Transaction Approve</h1>
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <div class="navbar-nav mr-auto">
        Domain: {{ options.domain }} would like to send a transaction
      </div>
      <button @click="approve">approve</button>
      <button @click="deny">deny</button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { KeyRecord } from "@enkryptcom/types";
import { getCustomError, getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
const { PromiseResolve, options, Request, sendToBackground } =
  WindowPromiseHandler();
const approve = () => {
  if (!Request.value.params || Request.value.params.length < 2) {
    return PromiseResolve.value({ error: getCustomError("No params") });
  }
  const msg = Request.value.params[0] as `0x{string}`;
  const account = Request.value.params[1] as KeyRecord;
  sendToBackground({
    method: InternalMethods.sign,
    params: [msg, account],
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
