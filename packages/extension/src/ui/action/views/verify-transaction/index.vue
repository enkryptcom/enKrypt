<template>
  <component v-bind="$props" :is="layout" />
</template>

<script setup lang="ts">
import VerifyTransactionSubstrate from "@/providers/polkadot/ui/send-transaction/verify-transaction/index.vue";
import VerifyTransactionEVM from "@/providers/ethereum/ui/send-transaction/verify-transaction/index.vue";
import VerifyTransactionBTC from "@/providers/bitcoin/ui/send-transaction/verify-transaction/index.vue";
import { useRoute } from "vue-router";
import { ProviderName } from "@/types/provider";
import { getNetworkByName } from "@/libs/utils/networks";
import { shallowRef } from "vue";

const sendLayouts: Record<ProviderName, any> = {
  [ProviderName.ethereum]: VerifyTransactionEVM,
  [ProviderName.polkadot]: VerifyTransactionSubstrate,
  [ProviderName.bitcoin]: VerifyTransactionBTC,
  [ProviderName.enkrypt]: null,
};
const layout = shallowRef();
const route = useRoute();
const networkName: string = route.query.id as string;
getNetworkByName(networkName).then((network) => {
  if (network) {
    layout.value = sendLayouts[network.provider];
  }
});
</script>
