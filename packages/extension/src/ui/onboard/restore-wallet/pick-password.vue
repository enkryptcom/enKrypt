<template>
  <div class="pick-password">
    <h3 class="pick-password__title">Pick a password</h3>
    <p class="pick-password__description">
      So no one else but you can unlock your wallet.
    </p>

    <div class="pick-password__form">
      <password-input :input="input" />
      <base-button title="Next" :click="nextAction" :disabled="isDisabled" />
    </div>

    <p class="pick-password__label">
      Best passwords are long and contain letters, numbers and special
      characters.
    </p>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import BaseButton from "@action/components/base-button/index.vue";
import PasswordInput from "@action/components/password-input/index.vue";
import { useRouter } from "vue-router";

const router = useRouter();

var password = ref("");
var isDisabled = ref(true);

const nextAction = () => {
  router.push({
    name: "restore-wallet-type-password",
    params: { password: password.value },
  });
};

const input = (text: string, isValid: boolean) => {
  password.value = text;
  isDisabled.value = !isValid;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.pick-password {
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
