<template>
  <component v-bind="$props" :is="layout" />
</template>

<script setup lang="ts">
import { getNetworkByName } from '@/libs/utils/networks';
import VerifyTransactionBTC from '@/providers/bitcoin/ui/send-transaction/verify-transaction/index.vue';
import VerifyTransactionEVM from '@/providers/ethereum/ui/send-transaction/verify-transaction/index.vue';
import VerifyTransactionKadena from '@/providers/kadena/ui/send-transaction/verify-transaction/index.vue';
import VerifyTransactionMultiversX from '@/providers/multiversx/ui/send-transaction/verify-transaction/index.vue';
import VerifyTransactionSubstrate from '@/providers/polkadot/ui/send-transaction/verify-transaction/index.vue';
import VerifyTransactionSolana from '@/providers/solana/ui/send-transaction/verify-transaction/index.vue';
import { ProviderName } from '@/types/provider';
import { shallowRef } from 'vue';
import { useRoute } from 'vue-router';

const sendLayouts: Record<ProviderName, any> = {
  [ProviderName.ethereum]: VerifyTransactionEVM,
  [ProviderName.polkadot]: VerifyTransactionSubstrate,
  [ProviderName.bitcoin]: VerifyTransactionBTC,
  [ProviderName.kadena]: VerifyTransactionKadena,
  [ProviderName.solana]: VerifyTransactionSolana,
  [ProviderName.multiversx]: VerifyTransactionMultiversX,
  [ProviderName.enkrypt]: null,
};
const layout = shallowRef();
const route = useRoute();
const networkName: string = route.query.id as string;
getNetworkByName(networkName).then(network => {
  if (network) {
    layout.value = sendLayouts[network.provider];
  }
});
</script>
