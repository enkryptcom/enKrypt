<template>
  <import-account-header
    :close="close"
    :back="back"
    :is-back="true"
  ></import-account-header>

  <div class="import-account-password">
    <h2>Enter password</h2>
    <p class="import-account-password__desc">
      Enter password for<br />
      <span>
        UTC--2022-05-20T09-11-40.793Z--7db66b572abb7c69a8ea75b793a4f1a1eee653fe
      </span>
      to import your wallet.
    </p>

    <base-input
      type="password"
      placeholder="Password"
      class="import-account-password__input"
      :class="{ error: isError }"
      :value="password"
      @update:value="passwordChanged"
      @keyup.enter="unlockAction"
    />
    <p v-show="isError" class="import-account-password__error">
      Key derivation failed – possibly wrong password.
    </p>

    <base-button
      title="Import account"
      :click="unlockAction"
      :disabled="isDisabled"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "ImportAccountPassword",
};
</script>

<script setup lang="ts">
import { PropType, ref, computed } from "vue";
import ImportAccountHeader from "../components/import-account-header.vue";
import BaseInput from "@action/components/base-input/index.vue";
import BaseButton from "@action/components/base-button/index.vue";

const password = ref("");
const isDisabled = computed(() => {
  return password.value.length < 5;
});
const isError = ref(false);

const props = defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  back: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  toImportAccount: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});

const passwordChanged = (text: string) => {
  password.value = text;
  isError.value = false;
};

const unlockAction = () => {
  props.toImportAccount();
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.import-account-password {
  width: 100%;

  h2 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 24px 0;
  }

  &__desc {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0 0 24px 0;
    word-break: break-all;

    span {
      font-weight: 500;
    }
  }

  &__input {
    margin: 0 0 24px 0;

    &.error {
      margin: 0 0 8px 0;
    }
  }

  &__error {
    width: 100%;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    letter-spacing: 0.25px;
    color: @error;
    margin: 0 0 24px 0;
  }
}
</style>
