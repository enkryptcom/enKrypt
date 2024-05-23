<template>
  <div class="new-wallet">
    <logo-big class="new-wallet__logo" />
    <h3>Privacy<br />Data collection.</h3>
    <p>random text about data collection</p>
    <p>
      more text about data collection ore text about data collectionore text
      about data collectionore text about data collectionore text about data
      collectionore text about data collectionore text about data s
    </p>

    <div class="new-wallet__buttons">
      <base-button title="Agree to anonymous data collection" :click="agree" />
      <base-button
        title="Deny anonymous data collection"
        :no-background="true"
        :click="deny"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import LogoBig from "@action/icons/common/logo-big.vue";
import BaseButton from "@action/components/base-button/index.vue";
import SettingsState from "@/libs/settings-state";
import { optOutofMetrics } from "@/libs/metrics";
import { routes as cwalletRoutes } from "./create-wallet/routes";
// import { routes as rwalletRoutes } from "./restore-wallet/routes";
import { useRouter } from "vue-router";

const router = useRouter();

const settingsState = new SettingsState();

const agree = async () => {
  const enkryptSettings = await settingsState.getEnkryptSettings();
  enkryptSettings.isMetricsEnabled = true;
  await settingsState.setEnkryptSettings(enkryptSettings);
  optOutofMetrics(false);
  router.push({ name: cwalletRoutes.walletReady.name });
};

const deny = async () => {
  const enkryptSettings = await settingsState.getEnkryptSettings();
  enkryptSettings.isMetricsEnabled = false;
  await settingsState.setEnkryptSettings(enkryptSettings);
  optOutofMetrics(true);
  router.push({ name: cwalletRoutes.walletReady.name });
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.new-wallet {
  &__logo {
    margin-bottom: 24px;
  }

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    margin: 0 0 16px 0;
    color: @primaryLabel;
  }

  &__buttons {
    text-align: center;

    a {
      margin-top: 8px;
    }
  }
}
</style>
