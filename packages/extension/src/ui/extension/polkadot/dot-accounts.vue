<template>
  <div id="app">
    <h1>Polkadot Account Request</h1>
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <div class="navbar-nav mr-auto">
        Domain: {{ options.domain }} would like to access your accounts
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
import WindowPromise from "../libs/window-promise-handler";
const { PromiseResolve, options, KeyRing } = WindowPromise();
const approve = () => {
  KeyRing.getAccounts([SignerType.ed25519, SignerType.sr25519]).then(
    (accounts) => {
      PromiseResolve.value({
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
const deny = () => {
  PromiseResolve.value({
    error: getError(ErrorCodes.userRejected),
  });
};
</script>
