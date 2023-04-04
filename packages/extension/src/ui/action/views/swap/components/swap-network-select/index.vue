<template>
  <a v-if="network" class="swap-token-select" @click="$emit('toggle:select')">
    <div class="swap-token-select__image">
      <img :src="network.logoURI" alt="" />
    </div>
    <div class="swap-token-select__info">
      <h5>To Network</h5>
      <p>
        {{ network.name }}
      </p>
    </div>

    <div class="swap-token-select__arrow">
      <switch-arrow />
    </div>
  </a>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import SwitchArrow from "@action/icons/header/switch_arrow.vue";
import { NetworkInfo } from "@enkryptcom/swap";
defineEmits<{
  (e: "toggle:select"): void;
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
@import "~@action/styles/theme.less";
.swap-token-select {
  height: 54px;
  background: #ffffff;
  box-sizing: border-box;
  border-radius: 10px;
  width: 100%;
  padding: 16px;
  margin-bottom: 3px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  transition: background 300ms ease-in-out;

  &:hover {
    background: @black007;
  }

  &__image {
    background: @buttonBg;
    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
    width: 32px;
    height: 32px;
    border-radius: 100%;
    overflow: hidden;
    margin-right: 12px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  &__info {
    h4 {
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      width: 290px;
      margin: 0;
    }
    h5 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      width: 290px;
      margin: 0 0 1px 0;
    }
    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @secondaryLabel;
      margin: 0;
      width: 290px;
      span {
        font-variant: small-caps;
      }
    }
  }
  &__arrow {
    position: absolute;
    font-size: 0;
    padding: 4px;
    right: 8px;
    top: 16px;
  }
}
</style>
