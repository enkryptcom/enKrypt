<template>
  <div id="app">
    <h1>Polkadot Account Request</h1>
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <div class="navbar-nav mr-auto">
        Domain: {{ Options.domain }} would like to access your accounts
      </div>
      <button @click="approve">approve</button>
      <button @click="deny">deny</button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { SignerType } from "@enkryptcom/types";
import { getError } from "@/libs/error";
import { ErrorCodes } from "@/providers/ethereum/types";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { onBeforeMount, ref } from "vue";
import { ProviderRequestOptions } from "@/types/provider";

const windowPromise = WindowPromiseHandler(0);
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
  const { Resolve, KeyRing } = await windowPromise;
  KeyRing.getAccounts([SignerType.ed25519, SignerType.sr25519]).then(
    (accounts) => {
      Resolve.value({
        result: JSON.stringify(
          accounts.map((acc) => {
            return {
              address: acc.address,
              genesisHash: "",
              name: acc.name,
              type: acc.type,
            };
          })
        ),
      });
    }
  );
};
const deny = async () => {
  const { Resolve } = await windowPromise;
  Resolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>
