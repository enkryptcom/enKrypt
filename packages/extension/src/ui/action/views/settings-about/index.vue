<template>
  <div>
    <settings-inner-header
      :back="back"
      :close="close"
      :is-about="true"
    ></settings-inner-header>

    <settings-button
      title="Visit our site"
      :action="siteAction"
      :is-link="true"
    ></settings-button>
    <settings-button
      title="We are on Telegram"
      :action="telegramAction"
      :is-link="true"
    ></settings-button>
    <settings-button
      title="We are on Twitter"
      :action="twitterAction"
      :is-link="true"
    ></settings-button>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import SettingsInnerHeader from "@action/views/settings/components/settings-inner-header.vue";
import SettingsButton from "@action/views/settings/components/settings-button.vue";

defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  back: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});

const siteAction = () => {
  window.open("https://www.myetherwallet.com/", "blanck");
};

const telegramAction = () => {
  window.open("https://t.me/myetherwallet", "blanck");
};

const twitterAction = () => {
  window.open("https://twitter.com/myetherwallet", "blanck");
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
</style>
