<template>
  <div>
    <settings-header :close="close"></settings-header>

    <div class="settings__block">
      <settings-button
        title="Contact support"
        :action="supportAction"
      ></settings-button>
      <settings-button
        title="General"
        :action="generalAction"
      ></settings-button>
    </div>

    <div class="settings__block">
      <settings-button
        title="Bug bounty program"
        :action="bugAction"
        :is-link="true"
      ></settings-button>
      <settings-button
        title="Privacy and terms"
        :action="privacyAction"
        :is-link="true"
      ></settings-button>
      <settings-button title="About" :action="aboutAction"></settings-button>
    </div>

    <div class="settings__block">
      <settings-button
        title="View my recovery phrase"
        :action="toggleSign"
      ></settings-button>
      <settings-button
        title="Reset wallet"
        :action="resetAction"
        :is-red="true"
      ></settings-button>
    </div>

    <div class="settings__copyright">
      <p>Version 0.1.4 build 2</p>
      <p>© 2022 by MyEtherWallet Inc.</p>
    </div>

    <modal-sign
      v-if="isOpenSign"
      :close="toggleSign"
      :forgot="toggleForgot"
      :unlock="unlockAction"
      :is-unlock="true"
    ></modal-sign>

    <modal-forgot
      v-if="isForgot"
      :is-forgot="isForgot"
      :toggle-forgot="toggleForgot"
      :reset-action="resetAction"
    ></modal-forgot>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import SettingsHeader from "@action/views/settings/components/settings-header.vue";
import SettingsButton from "@action/views/settings/components/settings-button.vue";
import ModalSign from "@action/views/modal-sign/index.vue";
import ModalForgot from "@action/views/modal-forgot/index.vue";

let isOpenSign = ref(false);
let isForgot = ref(false);

const props = defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  recoveryPhraseAction: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  resetAction: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  supportAction: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  generalAction: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  aboutAction: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});

const bugAction = () => {
  window.open("https://hackerone.com/myetherwallet?type=team", "blanck");
};

const privacyAction = () => {
  window.open("https://www.myetherwallet.com/privacy-policy", "blanck");
};

const toggleSign = () => {
  isOpenSign.value = !isOpenSign.value;
};
const toggleForgot = () => {
  isOpenSign.value = false;
  isForgot.value = !isForgot.value;
};

const unlockAction = () => {
  props.recoveryPhraseAction();
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.settings {
  &__copyright {
    padding: 0 48px;

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @tertiaryLabel;
      margin: 0;
    }
  }
}
</style>
