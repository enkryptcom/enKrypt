<template>
  <div class="unlock-keyring">
    <common-popup>
      <template #header>
        <sign-logo class="common-popup__logo" />
      </template>
      <template #content>
        <div class="unlock-keyring__content">
          <!-- Lock Icon -->
          <div class="unlock-keyring__icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          <h2 class="unlock-keyring__title">Unlock Wallet</h2>
          <p class="unlock-keyring__desc">
            Enter your password to continue signing
          </p>

          <div class="unlock-keyring__input-wrapper">
            <lock-screen-password-input
              :is-error="isError"
              :value="password"
              @update:value="passwordChanged"
              @keyup.enter="approve"
            />
          </div>

          <base-button
            title="Unlock"
            :click="approve"
            :disabled="isDisabled"
            class="unlock-keyring__submit"
          />

          <button
            class="unlock-keyring__forgot-btn"
            @click="toggleForgot"
            :disabled="isProcessing"
          >
            Forgot password?
          </button>

          <modal-forgot
            v-if="isForgot"
            :is-forgot="isForgot"
            @toggle:forgot="toggleForgot"
            :disabled="isProcessing"
          />
        </div>
      </template>
    </common-popup>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue';
import { WindowPromiseHandler } from '@/libs/window-promise';
import { InternalMethods } from '@/types/messenger';
import { ProviderRequestOptions } from '@/types/provider';
import CommonPopup from '@action/views/common-popup/index.vue';
import SignLogo from '@action/icons/common/sign-logo.vue';
import BaseButton from '@action/components/base-button/index.vue';
import LockScreenPasswordInput from '@action/views/lock-screen/components/lock-screen-password-input.vue';
import ModalForgot from '@action/views/modal-forgot/index.vue';
const windowPromise = WindowPromiseHandler(0);
const password = ref(__PREFILL_PASSWORD__!);
const isProcessing = ref(false);
const isDisabled = computed(() => {
  return password.value.length < 5 || isProcessing.value;
});
const isError = ref(false);
const isForgot = ref(false);
const errorMsg = ref('');
const Options = ref<ProviderRequestOptions>({
  domain: '',
  faviconURL: '',
  title: '',
  url: '',
  tabId: 0,
});
onBeforeMount(async () => {
  const { options } = await windowPromise;
  Options.value = options;
});
const approve = async () => {
  isProcessing.value = true;
  const { sendToBackground, Resolve } = await windowPromise;
  sendToBackground({
    method: InternalMethods.unlock,
    params: [password.value, false],
  }).then(res => {
    if (res.error) {
      errorMsg.value = res.error.message;
      isError.value = true;
      isProcessing.value = false;
    } else {
      Resolve.value({
        result: JSON.stringify(res.result),
      });
    }
  });
};
const passwordChanged = (text: string) => {
  password.value = text;
  isError.value = false;
};
const toggleForgot = () => {
  isForgot.value = !isForgot.value;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.unlock-keyring {
  position: relative;
  width: 100%;
  height: 100%;
  background: @white;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px 20px;
    text-align: center;
  }

  &__icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #8b5cf6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);

    svg {
      color: white;
    }
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
    color: @primaryLabel;
    margin: 0 0 8px 0;
    letter-spacing: -0.01em;
  }

  &__desc {
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    color: @secondaryLabel;
    margin: 0 0 24px 0;
  }

  &__input-wrapper {
    width: 100%;
    margin-bottom: 16px;
  }

  &__submit {
    width: 100%;
    margin-bottom: 12px;
  }

  &__forgot-btn {
    background: none;
    border: none;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 500;
    color: @primary;
    cursor: pointer;
    transition: opacity 0.2s ease;
    margin-bottom: 20px;

    &:hover {
      opacity: 0.8;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .common-popup {
    padding: 0 !important;
    background: @white !important;

    &__header {
      padding: 16px 20px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }

    &__content {
      padding: 0 !important;
      max-width: 100% !important;
    }

    &__logo {
      width: 80px !important;
      height: auto !important;
    }

    &__buttons {
      display: none !important;
      height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      overflow: hidden !important;
    }
  }

  .button {
    height: 48px !important;
    line-height: 48px !important;
    border-radius: 12px !important;
    font-size: 15px !important;
    font-weight: 600 !important;
  }

  .lock-screen-password-input {
    padding: 0 !important;
    background: @white;
    border: 1px solid @gray01;
    border-radius: 12px;
    transition: all 0.2s ease;

    &:focus-within {
      border-color: @primary;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }

    &__input {
      border: none !important;
      box-shadow: none !important;
      background: transparent !important;
    }

    &__error {
      position: relative !important;
      left: 0 !important;
      bottom: 0 !important;
      padding: 8px 12px !important;
    }
  }

  .modal-forgot__container {
    width: 100% !important;
    height: 100% !important;
    max-width: 460px !important;
    max-height: 600px !important;
  }

  .modal-forgot__overlay {
    border-radius: 12px;
  }

  .modal-forgot__wrap {
    width: auto !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  .lock-screen-forgot {
    width: calc(100vw - 40px) !important;
    max-width: 380px !important;
    margin: 0 auto !important;
  }
}
</style>
