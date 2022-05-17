<template>
  <div class="settings__container">
    <div class="settings__overlay" @click="close()"></div>
    <div class="settings__wrap">
      <settings-header :close="close"></settings-header>
      <base-select
        :select="selecLanguage"
        title="Language"
        :value="language"
        :list="languageList"
      ></base-select>
      <settings-button
        title="View my recovery phrase"
        :action="recoveryPhraseAction"
      ></settings-button>
      <settings-button
        title="Reset wallet"
        :action="resetAction"
        :is-red="true"
      ></settings-button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "Settings",
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import SettingsHeader from "./components/settings-header.vue";
import BaseSelect from "@action/components/base-select/index.vue";
import SettingsButton from "./components/settings-button.vue";

const languageList = ["English", "Russian"];
let language = ref("English");

defineProps({
  close: {
    type: Function,
    default: () => ({}),
  },
});

const selecLanguage = (value: string) => {
  language.value = value;
};

const recoveryPhraseAction = () => {
  console.log("recoveryPhraseAction");
};

const resetAction = () => {
  console.log("resetAction");
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.settings {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__wrap {
    background: @white;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    box-sizing: border-box;
    width: 460px;
    height: auto;
    z-index: 107;
    position: relative;
    max-height: 568px;
    overflow-x: hidden;
    padding-bottom: 16px;
  }

  &__container {
    width: 800px;
    height: 600px;
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
}
</style>
