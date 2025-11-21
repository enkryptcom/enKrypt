<template>
  <div class="new-wallet">
    <logo-big class="new-wallet__logo" />
    <h3>
      Privacy and<br />
      Data collection.
    </h3>
    <p>We collect the following anonymous data about your use of Enkrypt:</p>
    <p>
      Blockchain, browser, operating system, session time, actions and page
      views per visit, which we collect to enhance user experience with our
      Services, and support our operations:
    </p>
    <p>
      Choosing to decline anonymous data collection will have no impact on your
      experience using the Enkrypt browser extension. Full details about the
      anonymous data we collect and what we do with it are provided in our
      <a href="https://www.myetherwallet.com/privacy-policy" target="_blank"
        >Privacy Policy</a
      >.
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
import LogoBig from '@action/icons/common/logo-big.vue';
import BaseButton from '@action/components/base-button/index.vue';
import SettingsState from '@/libs/settings-state';
import { optOutofMetrics } from '@/libs/metrics';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const settingsState = new SettingsState();

const agree = async () => {
  const enkryptSettings = await settingsState.getEnkryptSettings();
  enkryptSettings.isMetricsEnabled = true;
  await settingsState.setEnkryptSettings(enkryptSettings);
  optOutofMetrics(false);
  if (route.name === 'user-privacy') {
    window.close();
  } else {
    router.push({ name: 'new-wallet' });
  }
};

const deny = async () => {
  const enkryptSettings = await settingsState.getEnkryptSettings();
  enkryptSettings.isMetricsEnabled = false;
  await settingsState.setEnkryptSettings(enkryptSettings);
  optOutofMetrics(true);
  if (route.name === 'user-privacy') {
    window.close();
  } else {
    router.push({ name: 'new-wallet' });
  }
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

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
