<template>
  <import-account-header
    :close="close"
    :back="back"
    :is-back="true"
  ></import-account-header>

  <div class="import-account-private-key" :class="{ process: isProcessing }">
    <h2>Import account with Private Key</h2>
    <p class="import-account-private-key__desc">
      Enter your private key string here
    </p>

    <textarea
      v-model="key"
      autocomplete="off"
      class="import-account-private-key__input"
      placeholder="Private key"
      autofocus
    >
    </textarea>

    <base-button
      title="Import account"
      :click="importAction"
      :disabled="!isValid"
    />
  </div>

  <import-account-process
    v-if="isProcessing"
    :is-private-key="true"
    :is-done="isDone"
  />
</template>

<script lang="ts">
export default {
  name: "ImportAccountPrivateKey",
};
</script>

<script setup lang="ts">
import { PropType, ref, computed } from "vue";
import ImportAccountHeader from "../components/import-account-header.vue";
import BaseButton from "@action/components/base-button/index.vue";
import ImportAccountProcess from "../components/import-account-process.vue";

let isProcessing = ref(false);
let isDone = ref(false);
let key = ref("");

defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  back: {
    type: Function,
    default: () => ({}),
  },
});

const importAction = () => {
  isProcessing.value = true;

  setTimeout(() => {
    isDone.value = true;
  }, 3000);
};

const isValid = computed(() => {
  return key.value.length > 10;
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.import-account-private-key {
  width: 100%;

  &.process {
    height: 228px;
    overflow: hidden;
  }

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
    margin: 0 0 8px 0;
  }

  &__input {
    width: 100%;
    height: 62px;
    background: @white;
    border: 1px solid rgba(95, 99, 104, 0.2);
    font-family: "Roboto";
    box-sizing: border-box;
    border-radius: 10px;
    margin-bottom: 24px;
    resize: none;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: @primaryLabel;
    outline: none !important;
    padding: 10px 12px;

    &:active,
    &:focus {
      border: 2px solid @primary;
      height: 64px;
    }
  }
}
</style>
