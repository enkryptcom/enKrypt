<template>
  <div class="swap-network-select__container">
    <button
      class="swap-network-select"
      :class="{ skeleton: !network }"
      @click="$emit('toggle:select')"
      :disabled="!network"
    >
      <div class="swap-network-select__image">
        <img v-if="network" :src="network.logoURI" alt="" />
      </div>
      <div class="swap-network-select__info">
        <h5>Network</h5>
        <p v-if="network">
          {{ network.name }}
        </p>
      </div>
      <switch-arrow class="swap-network-select__arrow" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import SwitchArrow from '@action/icons/header/switch_arrow.vue';
import { NetworkInfo } from '@enkryptcom/swap';
defineEmits<{
  (e: 'toggle:select'): void;
}>();

defineProps({
  network: {
    type: Object as PropType<NetworkInfo | null>,
  },
});
</script>

<style lang="less">
@import '@action/styles/theme.less';

.swap-network-select {
  flex-grow: 1;
  width: 100%;
  &:focus-visible {
    outline: none !important;
    border-color: @primary;
  }
  &__container {
    flex-grow: 1;
    width: 100%;
  }
  background: @white;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid @grey08;
  height: 52px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  cursor: pointer;
  text-decoration: none;
  transition: background 300ms ease-in-out;

  &:hover {
    background: @black007;
  }

  &__image {
    background: @white;
    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
    width: 32px;
    height: 32px;
    border-radius: 100%;
    overflow: hidden;
    margin-right: 8px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  &__info {
    flex-shrink: 1;
    text-align: left;
    h5 {
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @black06;
      margin: 0;
    }
    p {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @black;
      margin: 0;
      span {
        font-variant: small-caps;
      }
    }
    &__loading {
      width: 80px;
      height: 20px;
      border-radius: 20px;
    }
  }
  &__arrow {
    margin-left: auto;
    min-width: 24px;
  }
}
</style>
