import { defineStore } from "pinia";
import { ref } from "vue";
import { HWWalletAccountType } from "./types";
export const useHWStore = defineStore("hwWalletStore", () => {
  const selectedAccounts = ref<HWWalletAccountType[]>([]);

  const setSelectedAccounts = (accounts: HWWalletAccountType[]) => {
    selectedAccounts.value = accounts;
  };

  return { selectedAccounts, setSelectedAccounts };
});
