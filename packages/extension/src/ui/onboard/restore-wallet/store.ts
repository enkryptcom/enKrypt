import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRestoreStore = defineStore('restoreWallet', () => {
  const mnemonic = ref('');
  const password = ref('');
  const extraWord = ref('');

  const setMnemonic = (_mnemonic: string) => {
    mnemonic.value = _mnemonic;
  };
  const setPassword = (_password: string) => {
    password.value = _password;
  };
  const setExtraWord = (_extraWord: string) => {
    extraWord.value = _extraWord;
  };

  return { mnemonic, password, extraWord, setMnemonic, setPassword, setExtraWord };
});
