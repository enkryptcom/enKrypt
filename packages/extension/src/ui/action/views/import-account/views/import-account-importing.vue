<template>
  <import-account-header
    v-bind="$attrs"
    :is-back="true"
  ></import-account-header>

  <div class="import-account-importing" :class="{ process: isProcessing }">
    <h2>Importing account</h2>
    <hardware-importing-account :no-index="true"></hardware-importing-account>

    <p class="import-account-importing__example">
      Example: Private funds, Savings account, dApp account, Work funds,
      Airdrops
    </p>

    <base-button title="Import account" :click="importAction" />
  </div>

  <import-account-process
    v-if="isProcessing"
    :is-keystore="true"
    :is-done="isDone"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import ImportAccountHeader from "../components/import-account-header.vue";
import BaseButton from "@action/components/base-button/index.vue";
import HardwareImportingAccount from "@/ui/onboard/hardware-wallet/components/hardware-importing-account.vue";
import ImportAccountProcess from "../components/import-account-process.vue";

const isProcessing = ref(false);
const isDone = ref(false);

const importAction = () => {
  isProcessing.value = true;
  setTimeout(() => {
    isDone.value = true;
  }, 3000);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.import-account-importing {
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

  &__example {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @tertiaryLabel;
    margin: 8px 0 24px 0;
  }
}
</style>
