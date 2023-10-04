<template>
  <div class="mewwallet-banner">
    <img src="@action/assets/mewwallet-banner.png" alt="" />

    <div class="mewwallet-banner__content">
      <h5>Get MEW wallet for your mobile device</h5>
      <a href="#" class="button"><span>Get the app</span></a>
    </div>

    <a class="mewwallet-banner__close" @click="close">
      <close-icon />
    </a>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from "@action/icons/common/close-icon.vue";

defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => {
      return null;
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.mewwallet-banner {
  position: absolute;
  width: 324px;
  height: 120px;
  left: 8px;
  bottom: 64px;
  background: #ffffff;
  box-shadow: 0px 8px 16px -6px rgba(0, 0, 0, 0.12),
    0px 6px 8px -6px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 0 54px 0 126px;
  box-sizing: border-box;
  overflow: hidden;

  img {
    height: 104px;
    position: absolute;
    left: 16px;
    top: 16px;
  }

  &__content {
    padding: 16px 0 0 0;

    h5 {
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px; /* 125% */
      letter-spacing: 0.15px;
      color: @primaryLabel;
      margin: 0 0 8px 0;
    }

    a {
      text-decoration: none;
      width: auto;
      width: 109px;
    }
  }

  &__close {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    transition: opacity 300ms ease-in-out;
    opacity: 1;
    font-size: 0;

    &:hover {
      opacity: 0.7;
    }
  }
}
</style>
