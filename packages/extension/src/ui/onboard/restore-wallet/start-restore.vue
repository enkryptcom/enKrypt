<template>
  <div class="restore-wallet">
    <h3>Restore an<br />existing wallet</h3>
    <p>
      Use a 12 to 24 word recovery phrase to restore your the accounts in your
      wallet.
    </p>

    <div class="restore-wallet__buttons">
      <base-button title="Use recovery phrase" :click="restoreAction" />
      <base-button
        title="Other options"
        :no-background="true"
        :click="otherAction"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import BaseButton from "@action/components/base-button/index.vue";
import { useRouter } from "vue-router";
import { routes } from "./routes";
const router = useRouter();

const restoreAction = () => {
  router.push({ name: routes.enterRecoveryPhrase.name });
};

const otherAction = () => {
  router.push({ name: routes.otherInfo.name });
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.restore-wallet {
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
    color: @secondaryLabel;
    margin: 0 0 16px 0;
  }

  &__buttons {
    text-align: center;

    a {
      margin-top: 8px;
    }
  }
}
</style>
