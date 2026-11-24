<template>
  <AppModal
    v-model="isOpen"
    :title="title"
    :show-back-button="view !== 'start'"
    class="h-[568px]"
    @back="goBack"
    @closed="reset"
  >
    <transition
      enter-from-class="opacity-0 scale-95"
      enter-active-class="transform ease-out duration-200 transition"
      enter-to-class="opacity-100 scale-100"
      leave-from-class="opacity-100 scale-100"
      leave-active-class="transform ease-in duration-150 transition"
      leave-to-class="opacity-0 scale-95"
    >
      <settings-start
        v-if="view === 'start'"
        @action:reset="view = 'reset'"
        @action:about="view = 'about'"
        @action:general="view = 'general'"
        @action:recovery-phrase="recoveryPhraseAction"
        @action:support="supportAction"
      />
      <settings-general
        v-else-if="view === 'general'"
        @open:backups="view = 'backups'"
      />
      <settings-about v-else-if="view === 'about'" />
      <settings-recovery
        v-else-if="view === 'phrase'"
        :mnemonic="mnemonic"
        :show-header="false"
      />
      <reset-wallet v-else-if="view === 'reset'" />
      <settings-backups v-else-if="view === 'backups'" />
    </transition>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AppModal from '@common/components/modal/AppModal.vue';
import SettingsStart from '@action/components/settings/views/settings-start/index.vue';
import SettingsGeneral from '@action/components/settings/views/settings-general/index.vue';
import SettingsAbout from '@action/components/settings/views/settings-about/index.vue';
import SettingsRecovery from '@action/components/settings/views/settings-recovery/index.vue';
import ResetWallet from '@action/views/reset-wallet/index.vue';
import SettingsBackups from '@action/components/settings/views/settings-backups/index.vue';
import { MnemonicWithExtraWord } from '@enkryptcom/types';

type View = 'start' | 'general' | 'about' | 'phrase' | 'reset' | 'backups';

const TITLES: Record<View, string> = {
  start: 'Settings',
  general: 'General',
  about: 'About',
  phrase: 'Recovery phrase',
  reset: 'Reset wallet?',
  backups: 'Settings backup',
};

const EMPTY_MNEMONIC: MnemonicWithExtraWord = { mnemonic: '', extraWord: '' };

const isOpen = defineModel<boolean>({ required: true });

const view = ref<View>('start');
const mnemonic = ref<MnemonicWithExtraWord>(EMPTY_MNEMONIC);

const title = computed(() => TITLES[view.value]);

// Never keep the recovery phrase around once its screen is left.
const goBack = () => {
  mnemonic.value = EMPTY_MNEMONIC;
  view.value = view.value === 'backups' ? 'general' : 'start';
};

const reset = () => {
  mnemonic.value = EMPTY_MNEMONIC;
  view.value = 'start';
};

const recoveryPhraseAction = (phrase: MnemonicWithExtraWord) => {
  mnemonic.value = phrase;
  view.value = 'phrase';
};

const supportAction = () => {
  window.open('mailto:support@enkrypt.com', '_blank', 'noopener');
};
</script>
