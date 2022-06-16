<template>
  <div class="type-password">
    <h3 class="type-password__title">Type your password again</h3>
    <p class="type-password__description">
      There will be NO 'Restore password' button. Make sure you remember it.
    </p>

    <div class="type-password__form">
      <base-input
        type="password"
        :value="typePassword"
        placeholder="Password"
        @update:value="passwordUpdated"
        @keyup.enter="nextAction()"
      />

      <div
        v-if="isDisabled && typePassword.length > 0 && !isInitializing"
        class="type-password__error"
      >
        Passwords don't match
      </div>

      <base-button title="Next" :click="nextAction" :disabled="isDisabled" />
    </div>

    <p class="type-password__label">
      Since you're going to be your own bank, we won't be able to help if you
      loose your password.
    </p>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import BaseButton from "@action/components/base-button/index.vue";
import BaseInput from "@action/components/base-input/index.vue";
import { useRouter, useRoute } from "vue-router";
import { routes } from "../restore-wallet/routes";
import initializeWallet from "@/libs/utils/initialize-wallet";

const router = useRouter();
const route = useRoute();

const password = route.params.password as string;
const mnemonic = route.params.mnemonic as string;

const typePassword = ref("");
const isInitializing = ref(false);
const nextAction = () => {
  if (!isDisabled.value) {
    isInitializing.value = true;
    initializeWallet(mnemonic, password).then(() => {
      isInitializing.value = false;
      router.push({
        name: routes.walletReady.name,
      });
    });
  }
};
const isDisabled = computed(() => {
  return typePassword.value !== password || isInitializing.value;
});
const passwordUpdated = (value: string) => {
  typePassword.value = value.trim();
};

const checkMnemonicAndPassword = () => {
  if (!password || !mnemonic) {
    router.push({ path: routes.start.path });
  }
};

onMounted(() => {
  checkMnemonicAndPassword();
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.type-password {
  width: 100%;

  &__title {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 8px 0;
  }

  &__description {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0;
  }

  &__form {
    padding: 16px 0;

    .button {
      margin-top: 16px;
    }
  }

  &__error {
    padding-top: 8px;
    padding-left: 12px;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @error;
  }

  &__label {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: @secondaryLabel;
    margin: 0;
  }
}
</style>
