<template>
  <div class="blocked-page">
    <logo-big class="blocked-page__logo" />
    <h3>Access restricted</h3>
    <p>
      Your wallet address or IP has been flagged as originating from a
      restricted jurisdiction. Under our platform policies, access to our
      platform is therefore restricted. Please refer to our geographic policies
      page for more details.
    </p>
    <p>
      If this address has been incorrectly flagged, you can contact us at
      <a class="blocked-page__support" href="mailto:support@myetherwallet.com"
        >support@myetherwallet.com</a
      >.
    </p>
    <a
      class="blocked-page__more-info"
      target="_blank"
      href="https://help.myetherwallet.com/en/articles/12897302-geographic-restrictions-for-mew"
      >More info</a
    >
    <div v-if="isInitialized">
      <div class="blocked-page__divider-top"></div>
      <div class="blocked-page__content">
        <div class="blocked-page__content__header" @click="openUnlock">
          <h4>View My Secret Recovery Phrase</h4>
          <arrow-next />
        </div>
        <p class="blocked-page__content__body">
          Use this phrase to restore access to your funds in another wallet.
          Don't show this to anyone
        </p>
      </div>
      <div class="blocked-page__divider-bottom"></div>
    </div>
    <div class="blocked-page__footer">
      <div @click="supportAction">Contact support</div>
    </div>

    <modal-sign
      v-if="isOpenSign"
      :is-unlock="true"
      v-bind="$attrs"
      @window:close="closeUnlock"
      @toggle:forgot="openForgot"
      @action:recovery-phrase="displayMnemonic"
    />

    <modal-forgot
      v-if="isOpenForgot"
      :is-forgot="isOpenForgot"
      @toggle:forgot="closeForgot"
    />
  </div>

  <div class="settings__container" v-if="showMnemonic">
    <div class="settings__overlay" @click="closeMnemonic()" />
    <div class="settings__wrap">
      <settings-recovery
        :has-back="false"
        :mnemonic="mnemonic"
        @window:back="closeMnemonic"
        @window:close="closeMnemonic"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import arrowNext from '@action/icons/common/arrow-next.vue';
import LogoBig from '@action/icons/common/logo-big.vue';
import ModalSign from '@action/views/modal-sign/index.vue';
import ModalForgot from '@action/views/modal-forgot/index.vue';
import SettingsRecovery from '@action/views/settings/views/settings-recovery/index.vue';
import { MnemonicWithExtraWord } from '@enkryptcom/types';
import { ref } from 'vue';

defineProps({
  isInitialized: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});

const supportAction = () => {
  window.open('mailto:support@myetherwallet.com', '_blank', 'noopener');
};

const isOpenSign = ref(false);
const isOpenForgot = ref(false);
const mnemonic = ref<MnemonicWithExtraWord>({ mnemonic: '', extraWord: '' });
const showMnemonic = ref(false);

const openUnlock = () => {
  isOpenSign.value = true;
};

const closeUnlock = () => {
  isOpenSign.value = false;
};

const closeMnemonic = () => {
  showMnemonic.value = false;
  mnemonic.value = { mnemonic: '', extraWord: '' };
};

const displayMnemonic = (phrase: MnemonicWithExtraWord) => {
  closeUnlock();
  mnemonic.value = phrase;
  showMnemonic.value = true;
};

const openForgot = () => {
  isOpenForgot.value = true;
  closeUnlock();
};
const closeForgot = () => {
  isOpenForgot.value = false;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.settings {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__wrap {
    background: @white;
    box-shadow:
      0px 3px 6px rgba(0, 0, 0, 0.039),
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

.blocked-page {
  padding: 40px;

  &__footer {
    text-align: center;
    padding-top: 50px;

    div {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: 0.25px;
      margin: 0 0 16px 0;
      color: @primaryLabel;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  &__logo {
    margin-bottom: 24px;
  }

  &__divider-top {
    width: 100%;
    height: 1px;
    background: @darkBg;
    margin: 50px 0 20px;
  }

  &__divider-bottom {
    width: 100%;
    height: 1px;
    background: @darkBg;
    margin: 20px 0 50px;
  }

  &__content {
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;

      svg {
        width: 35px !important;
        height: 35px !important;
      }
    }

    &__body {
      font-style: normal;
      font-weight: 400;
      font-size: 14px !important;
      line-height: 20px;
      letter-spacing: 0.25px;
      margin: 16px 0 !important;
      color: @primaryLabel;
    }
  }

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
  }

  h4 {
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 26px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0;
  }

  &__support {
    color: @primaryLabel;
  }

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.25px;
    margin: 0 0 16px 0;
    color: @primaryLabel;
  }

  &__more-info {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.25px;
    margin: 0 0 16px 0;
    color: @primaryLabel;
    text-decoration: underline;
  }

  &__buttons {
    text-align: center;

    a {
      margin-top: 8px;
    }
  }
}
</style>
