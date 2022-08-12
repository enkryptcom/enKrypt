<template>
  <import-account-header v-bind="$attrs" :is-back="true" />

  <div class="import-account-keystore-file">
    <h2>Import account with Keystore File</h2>
    <p class="import-account-keystore-file__desc">
      Please select keystore file that unlocks your wallet.
    </p>
    <base-file-picker v-bind="$attrs" />
    <p class="import-account-keystore-file__label">
      Tip: default keystore file names often begin with “UTC”.
    </p>
    <p v-show="isError" class="import-account-keystore-file__error">
      Invalid file type
    </p>
  </div>
</template>

<script setup lang="ts">
import ImportAccountHeader from "../components/import-account-header.vue";
import BaseFilePicker from "@action/components/base-file-picker/index.vue";

defineProps({
  isError: Boolean,
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.import-account-keystore-file {
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
  }

  &__label {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: @tertiaryLabel;
    margin: 12px 0 0 0;
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
