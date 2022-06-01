<template>
  <div class="row">
    <div class="col-12">
      <div id="nav">
        <li v-for="route in routes" :key="route.path">
          <router-link :to="route.path">{{ route.name }}</router-link>
        </li>
        <a @click="abc">hw test</a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import routes from "./routes";
import HWwallet from "@enkryptcom/hw-wallets";
import { NetworkNames, HWwalletNames } from "@enkryptcom/types";
const hw = new HWwallet();
const abc = async () => {
  console.log(
    await hw.getAddress({
      confirmAddress: false,
      networkName: NetworkNames.Ethereum,
      path: "m/44'/60'/5'/0/0",
      wallet: HWwalletNames.trezor,
    })
  );
};
</script>
