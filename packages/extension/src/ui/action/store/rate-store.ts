import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRateStore = defineStore('useRateStore', () => {
  const isRatePopupOpen = ref(false);

  const toggleRatePopup = async (value: boolean) => {
    isRatePopupOpen.value = !!value;
  };

  return {
    isRatePopupOpen,
    toggleRatePopup,
  };
});
