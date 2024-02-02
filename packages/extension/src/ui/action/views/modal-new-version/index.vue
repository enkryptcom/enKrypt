<template>
  <div class="rate__container">
    <div class="rate__overlay" @click="close" />
    <div class="rate__wrap">
      <div class="rate__header">
        <h2>New Enkrypt version available</h2>
        <a class="rate__close" @click="close">
          <close-icon />
        </a>
      </div>
      <p>For latest and greatest features please update!</p>
      <p>
        You current version: {{ currentVersion }} latest version:
        {{ latestVersion }}
      </p>
      <base-button title="Update" :click="update" />
      <div class="rate__button-indent"></div>
      <base-button title="Cancel" :no-background="true" :click="close" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from "@action/icons/common/close-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import { openLink } from "@action/utils/browser";

const emit = defineEmits<{
  (e: "close:popup"): void;
}>();
const close = async () => {
  emit("close:popup");
};

interface IProps {
  currentVersion: string;
  latestVersion: string;
}

defineProps<IProps>();

const update = async () => {
  openLink("https://www.enkrypt.com");
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.rate {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__wrap {
    background: @white;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    box-sizing: border-box;
    width: 450px;
    height: auto;
    z-index: 107;
    position: relative;
    overflow-x: hidden;
    padding: 24px 16px;

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

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }

  &__container {
    width: 800px;
    height: 100%;
    left: 0px;
    top: 0px;
    position: fixed;
    z-index: 105;
    display: flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  &__overlay {
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }

  &__block {
    padding: 12px 0;

    &:nth-child(2) {
      padding-top: 0;
    }
  }
  &__button-indent {
    margin-bottom: 8px;
  }
}
</style>
