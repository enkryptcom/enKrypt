<template>
  <import-account-header :close="close"></import-account-header>

  <div class="import-account-start">
    <import-start-icon class="import-account-start__icon" />
    <h2>Import account</h2>
    <p>
      Imported accounts will not be associated with your Secret Recovery Phrase.
      In order to restore them in the future, you will need to use the original
      Keystore File or Private Key.
    </p>

    <a class="import-account-start__button" @click="toKeystore">
      <span>Keystore file</span>
      <right-arrow />
    </a>

    <a class="import-account-start__button" @click="toPrivate">
      <span>Private key</span>
      <right-arrow />
    </a>
  </div>
</template>

<script lang="ts">
export default {
  name: "ImportAccountStart",
};
</script>

<script setup lang="ts">
import { PropType } from "vue";
import ImportStartIcon from "@action/icons/import/import-start-icon.vue";
import ImportAccountHeader from "../components/import-account-header.vue";
import RightArrow from "@action/icons/common/right-arrow.vue";

defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  toKeystore: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  toPrivate: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.import-account-start {
  width: 100%;

  &__icon {
    margin-top: -24px;
  }

  h2 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 8px 0 8px 0;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0 0 24px 0;
  }

  &__button {
    width: 100%;
    height: 48px;
    border: 1px solid rgba(95, 99, 104, 0.2);
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    padding: 12px 12px 12px 16px;
    box-sizing: border-box;
    text-decoration: none;
    cursor: pointer;
    margin: 0 0 12px 0;

    span {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
