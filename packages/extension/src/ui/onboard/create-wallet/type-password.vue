<template>
  <div class="type-password">
    <h3 class="type-password__title">Confirm your password</h3>
    <p class="type-password__description">
      Enkrypt is non-custodial. We cannot restore or reset your password for
      you. Make sure you remember it.
    </p>

    <div class="type-password__form">
      <base-input
        type="password"
        :value="typePassword"
        placeholder="Password"
        @keyup.enter="nextAction()"
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
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import BaseButton from "@action/components/base-button/index.vue";
import BaseInput from "@action/components/base-input/index.vue";
import { useRouter } from "vue-router";
import { onMounted } from "vue";
import { routes } from "./routes";
import { useOnboardStore } from "./store";

const router = useRouter();
const store = useOnboardStore();

const password = store.password;

const typePassword = ref("");
const isDisabled = ref(true);

const nextAction = () => {
  if (!isDisabled.value) {
    router.push({
      name: routes.recoveryPhrase.name,
    });
  }
};

const passwordUpdated = (value: string) => {
  isDisabled.value = true;
  typePassword.value = value.trim();
  if (value.trim() === password) isDisabled.value = false;
};

onMounted(() => {
  if (!password) {
    router.push({ path: routes.pickPassword.path });
  }
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
