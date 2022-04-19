<template>
  <div class="lock-screen-forgot">
    <a class="lock-screen-forgot__close" @click="close">
      <close-icon />
    </a>
    <h2>Forgot password?</h2>
    <p>Enkrypt cannot recover your password for you.</p>
    <p>
      If you’re having trouble unlocking your account, you will need to reset
      your wallet.
    </p>

    <base-button
      title="Reset wallet"
      :click="reset"
      :red="true"
      class="lock-screen-forgot__reset"
    />

    <p class="lock-screen-forgot__info">
      Still need help? <a href="#">Contact support</a>
    </p>
  </div>
</template>

<script lang="ts">
export default {
  name: "LockScreenForgot",
};
</script>

<script setup lang="ts">
import { defineProps } from "vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";

const props = defineProps({
  close: {
    type: Function,
    default: () => {
      return null;
    },
  },
  reset: {
    type: Function,
    default: () => {
      return null;
    },
  },
});

const close = () => {
  props.close();
};

const reset = () => {
  props.reset();
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.lock-screen-forgot {
  background: @white;
  box-shadow: 0px 2px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  width: 360px;
  height: auto;
  box-sizing: border-box;
  padding: 24px 20px 20px 20px;
  position: relative;

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }

  h2 {
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 32px;
    color: @primaryLabel;
    margin: 0 0 8px 0;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0 0 8px 0;
  }

  &__reset {
    width: 100%;
    margin-top: 24px;
    margin-bottom: 36px;
  }

  &__info {
    font-size: 14px !important;
    line-height: 20px !important;
    margin: 0 !important;

    a {
      color: @secondaryLabel;

      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
