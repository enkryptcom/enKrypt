<template>
  <div class="best-offer-warning">
    <warning-icon />
    <p v-if="feeWarning">
      Warning: this token is designed to charge a fee every time it gets
      transferred. Because of this, upon transferring, you will get XXXXXX
      instead of YYYYYY
      <br />
      (Estimated token contract fee: ZZZZZ)
    </p>
    <p v-if="tokenWarning">
      Not enough FTM to complete swap.<br />You are 103.41 FTM short.
    </p>
  </div>
</template>

<script setup lang="ts">
import WarningIcon from "@action/icons/send/warning-icon.vue";
defineProps({
  feeWarning: {
    type: Boolean,
    default: false,
  },
  tokenWarning: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";
.best-offer-warning {
  margin: 0 0 8px 0;
  background: @orange01;
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
    color: @orange;
    margin: 0;
    a {
      color: @orange;
      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
