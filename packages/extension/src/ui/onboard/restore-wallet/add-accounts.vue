<template>
  <div class="add-accounts">
    <custom-scrollbar class="add-accounts__scroll-area" :settings="settings">
      <h3>Add accounts</h3>
      <p>If you had more than one account, and want to restore all of them, please select them.</p>

      <select-account-item
        v-for="(account, index) in accountsActive"
        :key="index"
        :number="index + 1"
        :account="account"
        :isActive="false"
      ></select-account-item>
    </custom-scrollbar>

    <div class="add-accounts__button">
      <base-button title="next" :click="nextAction" />
    </div>
  </div>
</template>
<script setup lang="ts">
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import SelectAccountItem from "@action/components/select-account-item/index.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { accountsActive } from "@action/types/mock";
import { useRouter } from "vue-router";

const router = useRouter();

const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};

const nextAction = () => {
  router.push({ name: "restore-wallet-wallet-ready", params: {} });
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.add-accounts {
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
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @secondaryLabel;
    margin: 0 0 16px 0;
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: calc(~'100% + 15px');
    max-height: 488px;
    padding-right: 15px;
    box-sizing: border-box;
  }

  &__button {
    width: 460px;
    height: 56px;
    left: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0px -1px 0px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(50px);
    position: absolute;
    padding: 8px 56px;
    box-sizing: border-box;
  }
}
</style>