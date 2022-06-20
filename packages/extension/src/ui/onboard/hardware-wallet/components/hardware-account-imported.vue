<template>
  <div class="hardware-account-imported">
    <connection-success />
    <h3>Account imported</h3>
    <p>Now you can close this tab and open Enkrypt.</p>
  </div>
</template>
<script setup lang="ts">
import ConnectionSuccess from "@action/icons/hardware/connection-success.vue";
</script>

<script lang="ts">
export default {
  name: "HardwareAccountImported",
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.hardware-account-imported {
  width: calc(~"100% + 112px");
  height: calc(~"100% + 112px");
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  left: -56px;
  top: -56px;
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
    color: @primary;
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
}
</style>
