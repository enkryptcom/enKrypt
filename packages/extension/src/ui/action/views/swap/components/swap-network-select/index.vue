<template>
  <a v-if="network" class="swap-network-select" @click="$emit('toggle:select')">
    <div class="swap-network-select__image">
      <img :src="network.logoURI" alt="" />
    </div>
    <div class="swap-network-select__info">
      <h5>Network</h5>
      <p>
        {{ network.name }}
      </p>
    </div>

    <switch-arrow class="swap-network-select__arrow" />
  </a>
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
    default: () => {
      return {};
    },
  },
});
</script>

<style lang="less">
@import '@action/styles/theme.less';
.swap-network-select {
  height: 46px;
  background: @white;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid @grey08;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  transition: background 300ms ease-in-out;
  gap: 8px;

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
    img {
      width: 100%;
      height: 100%;
    }
  }
  &__info {
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
      width: 102px;
      color: @black;
      margin: 0;
      span {
        font-variant: small-caps;
      }
    }
  }
  &__arrow {
    margin-left: auto;
    align-self: center;
  }
}
</style>
