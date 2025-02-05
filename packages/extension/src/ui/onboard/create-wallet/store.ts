import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOnboardStore = defineStore('newWallet', () => {
  const mnemonic = ref('');
  const password = ref('');

  const setMnemonic = (_mnemonic: string) => {
    mnemonic.value = _mnemonic;
  };
  const setPassword = (_password: string) => {
    password.value = _password;
  };

  return { mnemonic, password, setMnemonic, setPassword };
});
