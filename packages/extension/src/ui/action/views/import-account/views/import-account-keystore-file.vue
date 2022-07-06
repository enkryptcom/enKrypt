<template>
  <import-account-header
    :close="close"
    :back="back"
    :is-back="true"
  ></import-account-header>

  <div class="import-account-keystore-file">
    <h2>Import account with Keystore File</h2>
    <p class="import-account-keystore-file__desc">
      Please select keystore file that unlocks your wallet.
    </p>
    <base-file-picker :selected="selectFile" />
    <p class="import-account-keystore-file__label">
      Tip: default keystore file names often begin with “UTC”.
    </p>
  </div>
</template>

<script lang="ts">
export default {
  name: "ImportAccountKeystoreFile",
};
</script>

<script setup lang="ts">
import ImportAccountHeader from "../components/import-account-header.vue";
import BaseFilePicker from "@action/components/base-file-picker/index.vue";

const props = defineProps({
  close: {
    type: Function,
    default: () => ({}),
  },
  back: {
    type: Function,
    default: () => ({}),
  },
  toEnterPassword: {
    type: Function,
    default: () => ({}),
  },
});

const selectFile = (files: FileList) => {
  console.log(files);
  setTimeout(() => {
    props.toEnterPassword();
  }, 500);
};
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
}
</style>
