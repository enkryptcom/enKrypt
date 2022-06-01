<template>
  <div class="settings__container">
    <div class="settings__overlay" @click="close()"></div>
    <div class="settings__wrap">
      <settings-start
        v-if="isStart"
        :close="close"
        :recovery-phrase-action="recoveryPhraseAction"
        :reset-action="resetAction"
        :support-action="supportAction"
        :general-action="generalAction"
        :about-action="aboutAction"
      ></settings-start>
      <settings-general
        v-if="isGeneral"
        :back="startAction"
        :close="close"
      ></settings-general>
      <settings-support
        v-if="isSupport"
        :back="startAction"
        :close="close"
      ></settings-support>
      <settings-about
        v-if="isAbout"
        :back="startAction"
        :close="close"
      ></settings-about>
      <settings-recovery
        v-if="isPhrase"
        :back="startAction"
        :close="close"
      ></settings-recovery>
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
import SettingsStart from "@action/views/settings-start/index.vue";
import SettingsGeneral from "@action/views/settings-general/index.vue";
import SettingsSupport from "@action/views/settings-support/index.vue";
import SettingsAbout from "@action/views/settings-about/index.vue";
import SettingsRecovery from "@action/views/settings-recovery/index.vue";

const isStart = ref(true);
const isGeneral = ref(false);
const isAbout = ref(false);
const isSupport = ref(false);
const isPhrase = ref(false);

defineProps({
  close: {
    type: Function,
    default: () => ({}),
  },
});

const recoveryPhraseAction = () => {
  isStart.value = false;
  isGeneral.value = false;
  isAbout.value = false;
  isSupport.value = false;
  isPhrase.value = true;
};

const resetAction = () => {
  console.log("resetAction");
};

const supportAction = () => {
  isStart.value = false;
  isGeneral.value = false;
  isAbout.value = false;
  isSupport.value = true;
  isPhrase.value = false;
};

const generalAction = () => {
  isStart.value = false;
  isGeneral.value = true;
  isAbout.value = false;
  isSupport.value = false;
  isPhrase.value = false;
};

const aboutAction = () => {
  isStart.value = false;
  isGeneral.value = false;
  isAbout.value = true;
  isSupport.value = false;
  isPhrase.value = false;
};

const startAction = () => {
  isStart.value = true;
  isGeneral.value = false;
  isAbout.value = false;
  isSupport.value = false;
  isPhrase.value = false;
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
