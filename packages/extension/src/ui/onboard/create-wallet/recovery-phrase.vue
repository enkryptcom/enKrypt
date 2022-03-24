<template>
  <div class="recovery-phrase">
    <h3>Secret recovery phrase</h3>
    <p>
      Write it down on paper. Resist temptation to email it to yourself or
      screenshot it.
    </p>
    <p>
      Please keep your recovery phrase safe. If you give it to somebody, they
      will have full control of your funds.
    </p>

    <base-button title="Next" :click="nextAction" />
  </div>
</template>
<script setup lang="ts">
import BaseButton from "@action/components/base-button/index.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const nextAction = () => {
  // router.push({ name: "create-wallet-pick-password", params: {} });
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.recovery-phrase {
  width: 100%;

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 8px 0;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @orange;
    margin: 0 0 16px 0;
  }
}
</style>
