<template>
  <div class="wallet-ready">
    <logo-big class="wallet-ready__logo" />
    <h3>Your wallet is ready</h3>

    <div class="wallet-ready__social">
      <h4>Follow us</h4>
      <div class="wallet-ready__social-wrap">
        <a href="https://github.com/myetherwallet" target="_blank">
          <github-icon />
        </a>
        <a href="https://www.instagram.com/myetherwallet/" target="_blank">
          <instagram-icon />
        </a>
        <a href="https://www.reddit.com/r/MyEtherWallet/" target="_blank">
          <reddit-icon />
        </a>
        <a href="https://twitter.com/myetherwallet" target="_blank">
          <twitter-icon />
        </a>
      </div>
    </div>

    <base-button title="Finish" :click="finishAction" />
  </div>
</template>
<script setup lang="ts">
import BaseButton from "@action/components/base-button/index.vue";
import LogoBig from "@action/icons/common/logo-big.vue";
import GithubIcon from "@action/icons/social/github-icon.vue";
import InstagramIcon from "@action/icons/social/instagram-icon.vue";
import RedditIcon from "@action/icons/social/reddit-icon.vue";
import TwitterIcon from "@action/icons/social/twitter-icon.vue";

const finishAction = () => {
  window.close();
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.wallet-ready {
  width: 100%;

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
    margin: 0 0 24px 0;
  }

  &__social {
    margin-bottom: 24px;

    h4 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @secondaryLabel;
      margin: 0 0 8px 0;
    }

    &-wrap {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;

      a {
        display: block;
        margin-right: 24px;
      }
    }
  }
}
</style>
