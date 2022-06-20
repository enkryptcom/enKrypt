<template>
  <div class="trezor-select-account">
    <h3>Select an account</h3>
    <hardware-select-path :select="selectPatch"></hardware-select-path>
    <div class="trezor-select-account__list">
      <hardware-select-account></hardware-select-account>
      <hardware-select-account></hardware-select-account>
      <hardware-select-account></hardware-select-account>
      <hardware-select-account></hardware-select-account>
      <hardware-select-account></hardware-select-account>
    </div>
    <div class="trezor-select-account__controls">
      <a class="prev disable"><arrow-prev />Previous</a>
      <a>Next<arrow-next /></a>
    </div>

    <base-button
      class="trezor-select-account__button"
      title="Continue"
      :click="continueAction"
    />
  </div>
</template>
<script setup lang="ts">
import HardwareSelectPath from "../components/hardware-select-path.vue";
import HardwareSelectAccount from "../components/hardware-select-account.vue";
import BaseButton from "@action/components/base-button/index.vue";
import ArrowNext from "@action/icons/common/arrow-next.vue";
import ArrowPrev from "@action/icons/common/arrow-prev.vue";
import { useRouter } from "vue-router";
import { routes } from "../routes";

const router = useRouter();

const selectPatch = () => {
  console.log("selectPatch");
};

const continueAction = () => {
  router.push({ path: routes.trezorImportingAccount.path });
};
</script>

<script lang="ts">
export default {
  name: "TrezorSelectAccount",
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.trezor-select-account {
  width: 100%;
  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
  }
  &__list {
    font-size: 0;
    margin: 0 0 16px 0;
  }
  &__controls {
    margin: 0 0 32px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    a {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 4px 4px 4px 8px;
      height: 24px;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 6px;
      text-decoration: none;
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.8px;
      color: @primaryLabel;
      cursor: pointer;
      transition: opacity 300ms ease-in-out;
      opacity: 1;

      &:hover {
        opacity: 0.8;
      }
      &.disable {
        opacity: 0.2;
      }

      svg {
        margin-left: 4px;
      }

      &.prev {
        padding: 4px 8px 4px 4px;

        svg {
          margin-right: 4px;
          margin-left: 0;
        }
      }
    }
  }

  &__button {
    margin-bottom: -32px;
  }
}
</style>
