<template>
  <div class="blocked-page">
    <logo-big class="blocked-page__logo" />
    <h3>Access restricted</h3>
    <p>
      Unfortunately we are unable to service your geographic region. Your funds
      are safe, and you can access them in another wallet by using your recovery
      phrase.
    </p>
    <p>We apologize for the inconvenience.</p>
    <a href="#">More info</a>
    <div class="blocked-page__divider-top"></div>
    <div class="blocked-page__content">
      <div class="blocked-page__content__header">
        <mnemonic />
        <h4>View My Secret Recovery Phrase</h4>
        <arrow-next />
      </div>
      <p class="blocked-page__content__body">
        Use this phrase to restore access to your funds in another wallet. Don't
        show this to anyone
      </p>
    </div>
    <div class="blocked-page__divider-bottom"></div>
    <div class="blocked-page__footer">
      <a href="#">Contact support</a>
    </div>
  </div>
</template>
<script setup lang="ts">
import arrowNext from '../action/icons/common/arrow-next.vue';
import mnemonic from '../action/icons/actions/mnemonic.vue';
import LogoBig from '@action/icons/common/logo-big.vue';
</script>

<style lang="less">
@import '@action/styles/theme.less';

.blocked-page {
  &__footer {
    text-align: center;
    padding-top: 50px;

    a {
      text-decoration: none !important;
    }
  }
  &__logo {
    margin-bottom: 24px;
  }

  &__divider-top {
    width: 100%;
    height: 1px;
    background: @darkBg;
    margin: 50px 0 20px;
  }
  &__divider-bottom {
    width: 100%;
    height: 1px;
    background: @darkBg;
    margin: 20px 0 50px;
  }
  &__content {
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      svg {
        width: 35px !important;
        height: 35px !important;
      }
    }
    &__body {
      font-style: normal;
      font-weight: 400;
      font-size: 14px !important;
      line-height: 20px;
      letter-spacing: 0.25px;
      margin: 32px 0 16px 0 !important;
      padding: 0 20px;
      color: @primaryLabel;
    }
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

  h4 {
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 26px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.25px;
    margin: 0 0 16px 0;
    color: @primaryLabel;
  }
  a {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.25px;
    margin: 0 0 16px 0;
    color: @primaryLabel;
    text-decoration: underline;
  }

  &__buttons {
    text-align: center;

    a {
      margin-top: 8px;
    }
  }
}
</style>
