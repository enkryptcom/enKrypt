<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <router-link to="/" class="navbar-brand">Typescript</router-link>
      <div class="navbar-nav mr-auto">Test21</div>
      <button @click="onClick">click me</button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { newWindowOnMessageFromBackground } from "@/libs/messenger/extension";
import { OnMessageResponse } from "@enkryptcom/types";
let PromiseResolve: (res: OnMessageResponse) => void;
newWindowOnMessageFromBackground((msg): Promise<OnMessageResponse> => {
  console.log(msg);
  return new Promise((resolve) => {
    PromiseResolve = resolve;
  });
});
const onClick = () => {
  PromiseResolve({
    result: JSON.stringify(["0xe5DC07BdCDB8C98850050C7f67De7E164b1eA391"]),
  });
};
</script>
