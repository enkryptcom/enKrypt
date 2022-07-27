<template>
  <div class="hardware-account-imported">
    <import-done-animation />
    <h3>Accounts imported</h3>
    <p>Now you can close this tab and open Enkrypt.</p>
  </div>
</template>
<script setup lang="ts">
import ImportDoneAnimation from "@action/icons/import/import-done-animation.vue";
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.hardware-account-imported {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 5;
  background-color: @white;
  padding: 56px;
  box-sizing: border-box;

  h3 {
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 28px;
    text-align: center;
    letter-spacing: 0.15px;
    color: @success;
    margin: 24px 0 0 0;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    text-align: center;
    margin: 8px 0 24px 0;
  }

  svg {
    width: 72px;
    height: 72px;
  }
}
</style>
