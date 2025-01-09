import { CustomEvmNetworkOptions } from '@/providers/ethereum/types/custom-evm-network';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOnboardStore = defineStore('restoreWallet', () => {
  const evmOptions = ref({});
  const isEdit = ref(false);

  const setOptions = (options: CustomEvmNetworkOptions) => {
    evmOptions.value = options;
  };

  const setIsEdit = (edit: boolean) => {
    isEdit.value = edit;
  }

  return { setOptions, evmOptions, setIsEdit };
});
