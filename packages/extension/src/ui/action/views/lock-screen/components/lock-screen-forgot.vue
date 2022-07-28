<template>
  <div class="lock-screen-forgot">
    <a class="lock-screen-forgot__close" @click="$emit('toggle:forgot')">
      <close-icon />
    </a>
    <h2>Forgot password?</h2>
    <p>Enkrypt cannot recover your password for you.</p>
    <p>
      If you're having trouble unlocking your account, you will need to reset
      your wallet.
    </p>

    <div class="lock-screen-forgot__alert">
      <alert-icon />
      <p>
        Warning: Do not reset your wallet if you do not have your recovery
        phrase. There will be no way to restore your account and you could lose
        all of your assets.
      </p>
    </div>

    <base-input
      type="text"
      placeholder="Type Reset"
      class="lock-screen-forgot__input"
      :value="reset"
      :autofocus="true"
      @update:value="resetChanged"
    />

    <base-button
      title="Reset wallet"
      :click="resetAction"
      :red="true"
      class="lock-screen-forgot__reset"
      :disabled="isDisabled"
    />

    <p class="lock-screen-forgot__info">
      Still need help? <a href="mailto:support@enkrypt.com">Contact support</a>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import AlertIcon from "@action/icons/send/alert-icon.vue";
import BaseInput from "@action/components/base-input/index.vue";
import KeyRingBase from "@/libs/keyring/keyring";
import openOnboard from "@/libs/utils/open-onboard";

const reset = ref("");
const isProcessing = ref(false);
defineEmits<{
  (e: "toggle:forgot"): void;
}>();

const resetChanged = (newVal: string) => {
  reset.value = newVal;
};

const isDisabled = computed(() => {
  return reset.value !== "Reset" || isProcessing.value;
});

const resetAction = async () => {
  isProcessing.value = true;
  const keyring = new KeyRingBase();
  await keyring.reset();
  openOnboard();
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
    transition: background 300ms ease-in-out;

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
    margin-bottom: 24px;
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
  &__alert {
    background: @error01;
    border-radius: 10px;
    padding: 12px 16px 12px 56px;
    position: relative;
    box-sizing: border-box;
    margin: 24px 0 24px 0;

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
  &__label {
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: @primaryLabel;
    margin: 0 0 8px 0;
    display: block;
  }
  &__input {
    margin: 0 0 24px 0;
  }
}
</style>
