<template>
  <div class="modal-preload__container">
    <div class="modal-preload__overlay" />
    <div class="modal-preload__wrap">
      <Vue3Lottie
        class="modal-preload__loading"
        :animation-data="LottieSendProcess"
        :loop="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import LottieSendProcess from "@action/assets/animation/send-process.json";
import { Vue3Lottie } from "vue3-lottie";
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.modal-preload {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__wrap {
    width: auto;
    height: auto;
    z-index: 107;
    position: relative;
  }

  &__container {
    width: 100vw;
    height: 100vh;
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
    background: radial-gradient(
        100% 50% at 100% 50%,
        rgba(250, 250, 250, 0.92) 0%,
        rgba(250, 250, 250, 0.98) 100%
      )
      @primary;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }

  &__loading {
    width: 128px;
    height: 128px;
  }
}
</style>
