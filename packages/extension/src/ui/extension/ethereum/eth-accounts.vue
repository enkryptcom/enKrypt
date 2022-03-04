<template>
  <div id="app">
    <h1>Ethreum Account Request</h1>
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <div class="navbar-nav mr-auto">
        Domain: {{ domain }} would like to access your accounts
      </div>
      <button @click="approve">approve</button>
      <button @click="deny">deny</button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { newWindowOnMessageFromBackground } from "@/libs/messenger/extension";
import { OnMessageResponse, SignerType } from "@enkryptcom/types";
import PublicKeyRing from "@/libs/utils/public-keyring";
import { ProviderRPCRequest } from "@/types/provider";
import { getError } from "@/providers/ethereum/libs/error-handler";
import { ErrorCodes } from "@/providers/ethereum/types";
import { ref } from "vue";
let domain = ref("[domainName]");
let PromiseResolve: (res: OnMessageResponse) => void;
newWindowOnMessageFromBackground((message): Promise<OnMessageResponse> => {
  const { options } = JSON.parse(message.message) as ProviderRPCRequest;
  domain.value = options?.domain ? options?.domain : "unknown site";
  return new Promise((resolve) => {
    PromiseResolve = resolve;
  });
});
const approve = () => {
  const kr = new PublicKeyRing();
  kr.getAccounts([SignerType.secp256k1]).then((accounts) => {
    PromiseResolve({
      result: JSON.stringify(accounts.map((acc) => acc.address)),
    });
  });
};
const deny = () => {
  PromiseResolve({
    error: JSON.stringify(getError(ErrorCodes.userRejected)),
  });
};
</script>
