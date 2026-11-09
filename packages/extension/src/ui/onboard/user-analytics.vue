<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-heading-2xl my-3">Privacy and<br />Data collection.</h1>
    <p class="text-base">
      We collect the following anonymous data about your use of MEW extension:
    </p>
    <p class="text-base">
      Blockchain, browser, operating system, session time, actions and page
      views per visit, which we collect to enhance user experience with our
      Services, and support our operations:
    </p>
    <p class="text-base">
      Choosing to decline anonymous data collection will have no impact on your
      experience using the Enkrypt browser extension. Full details about the
      anonymous data we collect and what we do with it are provided in our
      <a
        href="https://www.myetherwallet.com/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
        class="text-text-brand hover:underline"
        >Privacy Policy</a
      >.
    </p>

    <app-btn class="mt-3" size="large" @click="agree">Agree</app-btn>
    <app-btn size="large" type="tertiary" @click="deny">Deny </app-btn>
  </div>
</template>
<script setup lang="ts">
import AppBtn from '@common/components/buttons/AppBtn.vue';
import SettingsState from '@/libs/settings-state';
import { optOutofMetrics } from '@/libs/metrics';
import { useRouter, useRoute } from 'vue-router';
import { OnboardRouteName } from './route-enums';

const router = useRouter();
const route = useRoute();

const settingsState = new SettingsState();

const agree = async () => {
  const enkryptSettings = await settingsState.getEnkryptSettings();
  enkryptSettings.isMetricsEnabled = true;
  await settingsState.setEnkryptSettings(enkryptSettings);
  optOutofMetrics(false);
  if (route.name === OnboardRouteName.UserPrivacy) {
    window.close();
  } else {
    router.push({ name: OnboardRouteName.NewWallet });
  }
};

const deny = async () => {
  const enkryptSettings = await settingsState.getEnkryptSettings();
  enkryptSettings.isMetricsEnabled = false;
  await settingsState.setEnkryptSettings(enkryptSettings);
  optOutofMetrics(true);
  if (route.name === OnboardRouteName.UserPrivacy) {
    window.close();
  } else {
    router.push({ name: OnboardRouteName.NewWallet });
  }
};
</script>
