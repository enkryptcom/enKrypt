<template>
  <div class="modal-sign__container">
    <div class="modal-sign__overlay" @click="$emit('window:close')" />
    <div class="modal-sign__wrap">
      <div class="modal-sign__header">
        <h3 v-if="isUnlock">Unlock with password</h3>
        <h3 v-else>Confirm with password</h3>

        <a class="modal-sign__close" @click="$emit('window:close')">
          <close-icon />
        </a>
      </div>
      <div class="modal-sign__content">
        <lock-screen-password-input
          :is-error="isError"
          :value="password"
          @update:value="passwordChanged"
          @keyup.enter="unlock"
        />

        <base-button
          :title="buttonTitle"
          :click="unlock"
          :disabled="isDisabled"
        />

        <base-button
          title="I forgot my password"
          :click="() => $emit('toggle:forgot')"
          :no-background="true"
          class="modal-sign__forgot"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import LockScreenPasswordInput from "@action/views/lock-screen/components/lock-screen-password-input.vue";
import KeyRingBase from "@/libs/keyring/keyring";

const emit = defineEmits<{
  (e: "toggle:forgot"): void;
  (e: "window:close"): void;
  (e: "action:recoveryPhrase", val: string): void;
}>();

const password = ref("");
const isError = ref(false);
const isProcessing = ref(false);

const isDisabled = computed(() => {
  return password.value.length < 5 || isProcessing.value;
});

const props = defineProps({
  isUnlock: {
    type: Boolean,
    default: false,
  },
});

const passwordChanged = (text: string) => {
  isError.value = false;
  password.value = text;
};

const unlock = () => {
  isProcessing.value = true;
  const keyring = new KeyRingBase();
  keyring
    .getMnemonic(password.value)
    .then((mnemonic) => {
      emit("action:recoveryPhrase", mnemonic);
    })
    .catch(() => {
      isError.value = true;
    })
    .finally(() => (isProcessing.value = false));
};

const buttonTitle = computed(() => {
  let title = "Confirm";
  if (props.isUnlock) {
    title = "Unlock";
  }
  return title;
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.modal-sign {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__header {
    width: 100%;
    background: @white;
    box-sizing: border-box;
    padding: 24px 64px 12px 32px;
    position: relative;
    z-index: 4;

    h3 {
      font-style: normal;
      font-weight: bold;
      font-size: 24px;
      line-height: 32px;
      margin: 0;
      color: @primaryLabel;
    }
  }

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

  &__content {
    padding: 16px 32px;
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

  &__forgot {
    margin-top: 16px;
  }
}
</style>
