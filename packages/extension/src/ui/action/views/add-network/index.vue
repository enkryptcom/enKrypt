<template>
  <div class="add-network__container">
    <div class="add-network__overlay" @click="emit('close:popup')" />
    <div class="add-network__wrap">
      <add-network-list
        v-if="isNetworkList"
        :close="closePopup"
        :to-custom="toCustomNetwork"
      />
      <add-custom-network v-else :close="closePopup" :back="toNetworkList" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AddNetworkList from './views/add-network-list.vue';
import AddCustomNetwork from './views/add-custom-network.vue';

import { trackNetwork } from '@/libs/metrics';
import { NetworkChangeEvents } from '@/libs/metrics/types';

const isNetworkList = ref(true);
const emit = defineEmits<{
  (e: 'close:popup'): void;
}>();

const closePopup = () => {
  isNetworkList.value = true;
  emit('close:popup');
};

const toCustomNetwork = () => {
  isNetworkList.value = false;
  trackNetwork(NetworkChangeEvents.NetworkAddCustomClicked, {});
};

const toNetworkList = () => {
  trackNetwork(NetworkChangeEvents.NetworkCustomBackButton, {});
  isNetworkList.value = true;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

.add-network {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__wrap {
    background: @white;
    box-shadow:
      0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    box-sizing: border-box;
    width: 460px;
    height: auto;
    z-index: 107;
    position: relative;
    height: 568px;
    overflow-x: hidden;
  }

  &__container {
    width: 800px;
    height: 600px;
    left: 0px;
    top: 0px;
    position: fixed;
    z-index: 105;
    display: flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  &__overlay {
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }
}
</style>
