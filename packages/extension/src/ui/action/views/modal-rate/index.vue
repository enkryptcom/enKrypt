<template>
  <app-dialog v-model="model" width="360px" is-centered @close:dialog="close">
    <div class="rate__wrap">
      <div class="rate__header">
        <h2>Enjoying Enkrypt so far?</h2>
      </div>
      <p>Let us know how you feel, your feedback is important to us.</p>
      <base-button title="Sure, I'll rate it" :click="goToRate" />
      <div class="rate__button-indent"></div>
      <base-button
        title="I have feedback"
        :no-background="true"
        :click="goToFeedback"
      />
    </div>
  </app-dialog>
</template>

<script setup lang="ts">
import AppDialog from '@action/components/app-dialog/index.vue';
import BaseButton from '@action/components/base-button/index.vue';
import RateState from '@/libs/rate-state';
import { detectBrowser, BROWSER_NAMES, openLink } from '@action/utils/browser';

const model = defineModel<boolean>();
const rateState = new RateState();

const close = async () => {
  await rateState.resetPopupTimer();
  model.value = false;
};

const goToFeedback = async () => {
  await rateState.resetPopupTimer();
  openLink('https://www.enkrypt.com/?ref=enkrypt_help');
  model.value = false;
};

const rateLinks: Record<string, string> = {
  [BROWSER_NAMES.chrome]:
    'https://chrome.google.com/webstore/detail/enkrypt-ethereum-polkadot/kkpllkodjeloidieedojogacfhpaihoh',
  [BROWSER_NAMES.firefox]:
    'https://addons.mozilla.org/en-US/firefox/addon/enkrypt/reviews/',
  [BROWSER_NAMES.opera]:
    'https://addons.opera.com/en/extensions/details/enkrypt/',
  [BROWSER_NAMES.edge]:
    'https://microsoftedge.microsoft.com/addons/detail/enkrypt-ethereum-polkad/gfenajajnjjmmdojhdjmnngomkhlnfjl',
  [BROWSER_NAMES.brave]:
    'https://chrome.google.com/webstore/detail/enkrypt-ethereum-polkadot/kkpllkodjeloidieedojogacfhpaihoh',
  [BROWSER_NAMES.safari]:
    'https://apps.apple.com/ae/app/enkrypt-web3-wallet/id1640164309?mt=12',
};

const goToRate = async () => {
  await rateState.setRated();

  const browser = detectBrowser();

  const rateLink = rateLinks[browser];

  if (rateLink) {
    openLink(rateLink);
  } else {
    openLink(rateLinks[BROWSER_NAMES.chrome]);
  }
  model.value = false;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.rate {
  &__wrap {
    width: 360px;
    height: auto;
    overflow-x: hidden;

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @secondaryLabel;
      margin: 0 0 12px 0;
    }
  }

  &__header {
    width: 100%;
    background: @white;
    box-sizing: border-box;
    padding: 0 40px 12px 0;

    h2 {
      font-style: normal;
      font-weight: bold;
      font-size: 24px;
      line-height: 32px;
      margin: 0;
      color: @primaryLabel;
    }
  }

  &__button-indent {
    margin-bottom: 8px;
  }
}
</style>
