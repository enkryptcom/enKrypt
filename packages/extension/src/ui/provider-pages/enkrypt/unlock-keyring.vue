<template>
  <div class="unlock-keyring">
    <common-popup>
      <template #header>
        <sign-logo class="common-popup__logo" />
      </template>
      <template #content>
        <h2>Signing Request</h2>
        <p class="unlock-keyring__desc">Unlock Enkrypt to start signing</p>
        <lock-screen-password-input
          :is-error="isError"
          :value="password"
          @update:value="passwordChanged"
          @keyup.enter="approve"
        />

        <base-button title="Unlock" :click="approve" :disabled="isDisabled" />

        <modal-forgot
          v-if="isForgot"
          :is-forgot="isForgot"
          :toggle-forgot="toggleForgot"
          :disabled="isProcessing"
        />
      </template>

      <template #button-left>
        <base-button
          title="I forgot my password"
          :click="toggleForgot"
          :no-background="true"
          :disabled="isProcessing"
          class="lock-screen__forgot"
        />
      </template>
    </common-popup>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, computed } from "vue";
import { WindowPromiseHandler } from "@/libs/window-promise";
import { InternalMethods } from "@/types/messenger";
import { ProviderRequestOptions } from "@/types/provider";
import CommonPopup from "@action/views/common-popup/index.vue";
import SignLogo from "@action/icons/common/sign-logo.vue";
import BaseButton from "@action/components/base-button/index.vue";
import LockScreenPasswordInput from "@action/views/lock-screen/components/lock-screen-password-input.vue";
import ModalForgot from "@action/views/modal-forgot/index.vue";
const windowPromise = WindowPromiseHandler(0);
const password = ref(process.env.PREFILL_PASSWORD!);
const isProcessing = ref(false);
const isDisabled = computed(() => {
  return password.value.length < 5 || isProcessing.value;
});
const isError = ref(false);
const isForgot = ref(false);
const errorMsg = ref("");
const Options = ref<ProviderRequestOptions>({
  domain: "",
  faviconURL: "",
  title: "",
  url: "",
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
    params: [password.value],
  }).then((res) => {
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
@import "~@/providers/ethereum/ui/styles/common-popup.less";
@import "~@action/styles/theme.less";

.unlock-keyring {
  position: relative;
  width: 100%;
  height: 100%;
  &:before {
    content: "";
    background: radial-gradient(
        100% 50% at 100% 50%,
        rgba(250, 250, 250, 0.92) 0%,
        rgba(250, 250, 250, 0.98) 100%
      )
      @primary;
    width: calc(~"100% + 112px");
    height: 100%;
    position: absolute;
    left: -56px;
    top: 0;
  }

  &__desc {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0 0 8px 0;
  }

  .common-popup__buttons {
    background: none;
    padding: 24px 0;
  }

  .common-popup__buttons-cancel {
    width: 100%;
  }

  .common-popup__buttons-send {
    width: 0;
  }
}
</style>
