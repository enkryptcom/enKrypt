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
      />

      <div
        v-if="isDisabled && typePassword.length > 0"
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
import { ref } from "vue";
import BaseButton from "@action/components/base-button/index.vue";
import BaseInput from "@action/components/base-input/index.vue";
import { useRouter, useRoute } from "vue-router";
import { onMounted } from "vue";

const router = useRouter();
const route = useRoute();

const password = route.params.password;

const typePassword = ref("");
const isDisabled = ref(true);

const nextAction = () => {
  router.push({ name: "create-wallet-recovery-phrase", params: { password } });
};

const passwordUpdated = (value: string) => {
  isDisabled.value = true;
  if (value.trim() === password) isDisabled.value = false;
};

onMounted(() => {
  if (!password) router.back();
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
