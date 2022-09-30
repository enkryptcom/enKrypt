<template>
  <div class="settings__container">
    <div class="settings__overlay" @click="close()" />
    <div class="settings__wrap">
      <settings-start
        v-if="isStart"
        @action:reset="resetAction"
        @action:about="aboutAction"
        @action:general="generalAction"
        @action:recovery-phrase="recoveryPhraseAction"
        @action:support="supportAction"
        @window:close="close"
      />
      <settings-general
        v-if="isGeneral"
        @window:close="close"
        @window:back="startAction"
      />
      <settings-support
        v-if="isSupport"
        @window:close="close"
        @window:back="startAction"
      />
      <settings-about
        v-if="isAbout"
        @window:close="close"
        @window:back="startAction"
      />
      <settings-recovery
        v-if="isPhrase"
        :mnemonic="mnemonic"
        @window:close="close"
        @window:back="startAction"
      />
      <reset-wallet
        v-if="isReset"
        @window:close="close"
        @window:back="startAction"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SettingsStart from "./views/settings-start/index.vue";
import SettingsGeneral from "./views/settings-general/index.vue";
import SettingsSupport from "./views/settings-support/index.vue";
import SettingsAbout from "./views/settings-about/index.vue";
import SettingsRecovery from "./views/settings-recovery/index.vue";
import ResetWallet from "@action/views/reset-wallet/index.vue";

const isStart = ref(true);
const isGeneral = ref(false);
const isAbout = ref(false);
const isSupport = ref(false);
const isPhrase = ref(false);
const isReset = ref(false);
const mnemonic = ref("");

const emit = defineEmits<{
  (e: "close:popup"): void;
}>();
const close = () => {
  emit("close:popup");
};
const setAllToFalse = () => {
  isStart.value = false;
  isGeneral.value = false;
  isAbout.value = false;
  isSupport.value = false;
  isPhrase.value = false;
  isReset.value = false;
  mnemonic.value = "";
};
const recoveryPhraseAction = (phrase: string) => {
  setAllToFalse();
  isPhrase.value = true;
  mnemonic.value = phrase;
};

const resetAction = () => {
  setAllToFalse();
  isReset.value = true;
};

const supportAction = () => {
  window.open("mailto:support@enkrypt.com", "_blank", "noopener");
};

const generalAction = () => {
  setAllToFalse();
  isGeneral.value = true;
};

const aboutAction = () => {
  setAllToFalse();
  isAbout.value = true;
};

const startAction = () => {
  setAllToFalse();
  isStart.value = true;
};
</script>

<style lang="less">
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
    height: 568px;
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

  &__block {
    padding: 12px 0;

    &:nth-child(2) {
      padding-top: 0;
    }
  }
}
</style>
