<template>
  <div class="send-alert">
    <alert-icon />
    <p>
      After sending this transaction your balance will go below Existential
      Limit, which will drop your remaining balance to 0.<br />
      <a href="#">What is Existential Limit?</a>
    </p>
  </div>
</template>

<script setup lang="ts">
import AlertIcon from "@action/icons/send/alert-icon.vue";
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-alert {
  margin: 0 32px 8px 32px;
  background: @error01;
  border-radius: 10px;
  padding: 12px 16px 12px 57px;
  position: relative;
  box-sizing: border-box;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    margin-top: -12px;
  }

  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @error;
    margin: 0;

    a {
      color: @error;

      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
