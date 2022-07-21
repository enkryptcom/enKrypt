<template>
  <div>
    <settings-inner-header
      v-bind="$attrs"
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
import SettingsInnerHeader from "@action/views/settings/components/settings-inner-header.vue";
import SettingsButton from "@action/views/settings/components/settings-button.vue";

const siteAction = () => {
  window.open("https://www.enkrypt.com/", "_blank");
};

const telegramAction = () => {
  window.open("https://t.me/myetherwallet", "_blank");
};

const twitterAction = () => {
  window.open("https://twitter.com/enkryptcom", "_blank");
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
</style>
