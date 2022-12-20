<template>
  <component v-bind="$props" :is="layout" />
</template>

<script setup lang="ts">
import SendTransactionSubstrate from "@/providers/polkadot/ui/send-transaction/index.vue";
import SendTransactionEVM from "@/providers/ethereum/ui/send-transaction/index.vue";
import SendTransactionBTC from "@/providers/bitcoin/ui/send-transaction/index.vue";
import { useRoute } from "vue-router";
import { ProviderName } from "@/types/provider";
import { getNetworkByName } from "@/libs/utils/networks";
import { shallowRef } from "vue";

const sendLayouts: Record<ProviderName, any> = {
  [ProviderName.ethereum]: SendTransactionEVM,
  [ProviderName.polkadot]: SendTransactionSubstrate,
  [ProviderName.bitcoin]: SendTransactionBTC,
  [ProviderName.enkrypt]: null,
};
const layout = shallowRef();
const route = useRoute();
const networkName: string = route.params.id as string;
getNetworkByName(networkName).then((network) => {
  if (network) {
    layout.value = sendLayouts[network.provider];
  }
});
</script>
