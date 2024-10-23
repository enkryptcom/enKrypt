<template>
  <component
    :is="layout"
    :account-info="localAccounts"
    :network="localNetwork"
  />
</template>

<script setup lang="ts">
import SendTransactionSubstrate from '@/providers/polkadot/ui/send-transaction/index.vue';
import SendTransactionEVM from '@/providers/ethereum/ui/send-transaction/index.vue';
import SendTransactionBTC from '@/providers/bitcoin/ui/send-transaction/index.vue';
import SendTransactionKadena from '@/providers/kadena/ui/send-transaction/index.vue';
import SendTransactionSolana from '@/providers/solana/ui/send-transaction/index.vue';
import { useRoute } from 'vue-router';
import { ProviderName } from '@/types/provider';
import { getNetworkByName } from '@/libs/utils/networks';
import { shallowRef, ref, PropType } from 'vue';
import { BaseNetwork } from '@/types/base-network';
import { AccountsHeaderData } from '../../types/account';

const sendLayouts: Record<ProviderName, any> = {
  [ProviderName.ethereum]: SendTransactionEVM,
  [ProviderName.polkadot]: SendTransactionSubstrate,
  [ProviderName.bitcoin]: SendTransactionBTC,
  [ProviderName.kadena]: SendTransactionKadena,
  [ProviderName.solana]: SendTransactionSolana,
  [ProviderName.enkrypt]: null,
};

const layout = shallowRef();
const route = useRoute();
const localNetwork = ref<BaseNetwork>();
const localAccounts = ref<AccountsHeaderData>();
const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});
const networkName: string = route.params.id as string;
getNetworkByName(networkName).then(network => {
  if (network) {
    localNetwork.value = props.network;
    localAccounts.value = props.accountInfo;
    layout.value = sendLayouts[network.provider];
  }
});
</script>
