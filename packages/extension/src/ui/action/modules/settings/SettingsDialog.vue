<template>
  <AppModal
    v-model="isOpen"
    :title="title"
    :show-back-button="view !== 'main'"
    class="h-full w-[400px]"
    @back="goBack"
    @closed="reset"
  >
    <!-- Full available height whatever the screen, so nothing jumps; the
         active screen scrolls on its own. One screen at a time: out-in lets
         the old one slide away before the new one slides in. -->
    <div class="h-full overflow-hidden">
      <Transition
        mode="out-in"
        enter-active-class="transition duration-200 ease-out"
        leave-active-class="transition duration-150 ease-in"
        :enter-from-class="
          isForward ? 'translate-x-6 opacity-0' : '-translate-x-6 opacity-0'
        "
        :leave-to-class="
          isForward ? '-translate-x-6 opacity-0' : 'translate-x-6 opacity-0'
        "
      >
        <!-- Main screen -->
        <div
          v-if="view === 'main'"
          key="main"
          class="h-full overflow-y-auto px-2 pb-6"
        >
          <settings-start
            @action:currency="open('currency')"
            @action:backups="open('backups')"
            @action:reset="open('reset')"
            @action:recovery-phrase="recoveryPhraseAction"
            @action:support="supportAction"
          />
        </div>

        <!-- Sub screen -->
        <div v-else :key="view" class="h-full overflow-y-auto px-2 pb-6">
          <settings-currency v-if="view === 'currency'" @selected="goBack" />
          <settings-backups v-else-if="view === 'backups'" />
          <settings-recovery
            v-else-if="view === 'phrase'"
            :mnemonic="mnemonic"
            :show-header="false"
          />
          <reset-wallet v-else-if="view === 'reset'" />
        </div>
      </Transition>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AppModal from '@common/components/modal/AppModal.vue';
import SettingsStart from '@action/modules/settings/views/SettingsViewStart.vue';
import SettingsCurrency from '@action/modules/settings/views/SettingsViewCurrency.vue';
import SettingsRecovery from '@action/modules/settings/views/SettingsViewRecovery.vue';
import SettingsBackups from '@action/modules/settings/views/SettingsViewBackups.vue';
import ResetWallet from '@action/views/reset-wallet/index.vue';
import { MnemonicWithExtraWord } from '@enkryptcom/types';

type SubView = 'currency' | 'backups' | 'phrase' | 'reset';

const TITLES: Record<'main' | SubView, string> = {
  main: 'Settings',
  currency: 'Select currency',
  backups: 'Settings backup',
  phrase: 'Recovery phrase',
  reset: 'Reset wallet?',
};

const EMPTY_MNEMONIC: MnemonicWithExtraWord = { mnemonic: '', extraWord: '' };

const isOpen = defineModel<boolean>({ required: true });

const view = ref<'main' | SubView>('main');
/** Slide direction: into a sub screen moves left, back to main moves right. */
const isForward = ref(true);
const title = computed(() => TITLES[view.value]);
const mnemonic = ref<MnemonicWithExtraWord>(EMPTY_MNEMONIC);

const open = (target: SubView) => {
  isForward.value = true;
  view.value = target;
};

// Never keep the recovery phrase around once its screen is left.
const goBack = () => {
  mnemonic.value = EMPTY_MNEMONIC;
  isForward.value = false;
  view.value = 'main';
};

const reset = () => {
  mnemonic.value = EMPTY_MNEMONIC;
  view.value = 'main';
};

const recoveryPhraseAction = (phrase: MnemonicWithExtraWord) => {
  mnemonic.value = phrase;
  open('phrase');
};

const supportAction = () => {
  window.open('mailto:support@enkrypt.com', '_blank', 'noopener');
};
</script>
