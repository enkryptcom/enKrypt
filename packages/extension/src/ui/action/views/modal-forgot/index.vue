<template>
  <div class="modal-forgot__container">
    <div class="modal-forgot__overlay" />
    <div class="modal-forgot__wrap">
      <lock-screen-forgot v-show="isForgot" v-bind="$attrs" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LockScreenForgot from "@action/views/lock-screen/components/lock-screen-forgot.vue";

defineProps({
  isForgot: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.modal-forgot {
  width: 100%;
  height: auto;
  box-sizing: border-box;

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
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }

  &__wrap {
    background: @white;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    box-sizing: border-box;
    width: 360px;
    height: auto;
    z-index: 107;
    position: relative;
    max-height: 568px;
    overflow-x: hidden;
  }
}
</style>
