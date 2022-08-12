<template>
  <import-account-header v-bind="$attrs" />

  <div class="import-account-start">
    <import-start-icon class="import-account-start__icon" />
    <h2>Import account</h2>
    <p class="import-account-start__min-inset">
      Imported accounts will not be associated with your Secret Recovery Phrase.
      In order to restore them in the future, you will need to use the original
      Keystore File or Private Key.
    </p>

    <label class="import-account-start__label"
      >Enter secret recovery phrase</label
    >
    <textarea
      v-model="mnemonic"
      autocomplete="off"
      class="import-account-start__input"
      placeholder="witch collapse practice feed shame open despair creek road again ice least"
      autofocus
    />

    <label-input
      type="text"
      label="Derivation path"
      class="import-account-start__input-path"
      :value="path"
      @update:value="pathChanged"
    />

    <base-button
      class="import-account-start__next"
      title="Next"
      :disabled="!isValid"
      :click="toSelectAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, computed } from "vue";
import ImportStartIcon from "@action/icons/import/import-start-icon.vue";
import ImportAccountHeader from "../components/import-account-header.vue";
import BaseButton from "@action/components/base-button/index.vue";
import LabelInput from "@action/components/label-input/index.vue";

const mnemonic = ref("");
const path = ref("//");

defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  toSelectAccount: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});

const isValid = computed(() => {
  return mnemonic.value.length > 10;
});

const pathChanged = (newVal: string) => {
  path.value = newVal;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.import-account-start {
  &__input {
    width: 100%;
    height: 114px;
    background: rgba(95, 99, 104, 0.01);
    border: 1px solid rgba(95, 99, 104, 0.2);
    font-family: "Roboto";
    box-sizing: border-box;
    border-radius: 10px;
    margin-bottom: 8px;
    resize: none;
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    text-align: center;
    color: @primaryLabel;
    outline: none !important;
    padding: 32px 16px;

    &:active,
    &:focus {
      border: 2px solid @primary;
      padding: 31px 16px;
    }
  }

  &__label {
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.15px;
    color: @primaryLabel;
    margin: 0 0 8px 0;
    display: block;
  }

  &__min-inset {
    margin: 0 0 16px 0 !important;
  }

  &__input-path {
    margin: 0 0 24px 0 !important;
  }

  &__next {
    margin: 0 0 -24px 0 !important;
  }
}
</style>
