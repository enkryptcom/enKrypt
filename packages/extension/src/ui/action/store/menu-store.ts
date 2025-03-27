import { defineStore } from 'pinia'
import { ref, } from 'vue';
import MenuState from '@/libs/menu-state';

export const useMenuStore = defineStore('useMenuStore', () => {

  const menuState = new MenuState();
  const isExpanded = ref(false);

  const setIsExpanded = async (value: boolean) => {
    isExpanded.value = value;
    menuState.setIsExpanded(value);
  }

  const init = async () => {
    isExpanded.value = await menuState.getIsExpanded();
  }

  return {
    menuState,
    isExpanded,
    setIsExpanded,
    init
  }
})

