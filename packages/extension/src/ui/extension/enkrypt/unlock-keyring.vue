<template>
  <div id="app">
    <h1>Unlock Keyring Request</h1>
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <div class="navbar-nav mr-auto">
        Domain: {{ domain }} would like to unlock keyring
      </div>
      <div>
        <input v-model="password" />
        <br />
        {{ errorMsg }}
      </div>
      <button @click="approve">approve</button>
      <button @click="deny">deny</button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { newWindowOnMessageFromBackground } from "@/libs/messenger/extension";
import KeyRing from "@/libs/keyring/keyring";
import { ProviderRPCRequest } from "@/types/provider";
import { getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { ref } from "vue";
import { InternalOnMessageResponse } from "@/types/messenger";
let domain = ref("[domainName]");
let password = ref("");
let errorMsg = ref("");
let PromiseResolve: (res: InternalOnMessageResponse) => void;
newWindowOnMessageFromBackground(
  (message): Promise<InternalOnMessageResponse> => {
    const { options } = JSON.parse(message.message) as ProviderRPCRequest;
    domain.value = options?.domain ? options?.domain : "unknown site";
    return new Promise((resolve) => {
      PromiseResolve = resolve;
    });
  }
);
const approve = () => {
  const kr = KeyRing;
  console.log(password.value);
  kr.unlock(password.value)
    .then(() => {
      PromiseResolve({
        result: JSON.stringify(true),
      });
    })
    .catch((err) => {
      errorMsg.value = err.message;
    });
};
const deny = () => {
  PromiseResolve({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>
