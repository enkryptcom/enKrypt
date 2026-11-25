<template>
  <main class="flex flex-col p-10 text-text-default text-text-base">
    <img :src="appLogo" alt="MEW" class="mr-auto mb-6 h-10" />
    <h1 class="mb-4 text-heading-2xl">Access restricted</h1>
    <p v-if="!isAddressRestricted" class="mb-4">
      Your IP has been flagged as originating from a restricted jurisdiction.
      Under our platform policies, access to our platform is therefore
      restricted. Please refer to our geographic policies page for more details.
    </p>
    <p v-if="isAddressRestricted" class="mb-4">
      Your wallet address [{{ restrictedAddress }}] is associated with suspect
      activities. Under our platform policies, access to our platform is
      therefore restricted.
    </p>
    <p class="mb-4 text-text-base">
      If you believe this has been incorrectly flagged, you can contact us at
      <a
        class="text-text-brand underline"
        href="mailto:support@myetherwallet.com"
        >support@myetherwallet.com</a
      >.
    </p>
    <a
      class="mb-4 text-label-base hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      href="https://help.myetherwallet.com/en/articles/12897302-geographic-restrictions-for-mew"
      >More info →</a
    >
    <div v-if="isInitialized">
      <!-- <div class="mt-[50px] h-px w-full bg-border-default"></div> -->
      <div
        v-if="isAddressRestricted"
        class="py-5 flex flex-col items-center justify-center"
      >
        <AppBtn class="min-w-[200px]" @click="emit('restricted:switchAccount')">
          Switch Address
          <template #trailing>
            <AppIcon name="chevron-right" size="l" />
          </template>
        </AppBtn>
        <p class="mt-4 text-text-sm text-text-subtle">
          Switch to a different address
        </p>
      </div>
      <div
        v-if="!isAddressRestricted"
        class="py-5 flex flex-col items-center justify-center"
      >
        <AppBtn @click="openUnlock">
          View My Recovery Phrase
          <template #trailing>
            <AppIcon name="chevron-right" size="l" />
          </template>
        </AppBtn>
        <p class="mt-4 text-text-sm text-text-subtle">
          Use this phrase to restore access to your funds in another wallet.
          Don't show this to anyone
        </p>
      </div>
    </div>
    <div class="pt-[90px] text-center">
      <AppBtn type="link" @click="supportAction">Contact support</AppBtn>
    </div>

    <modal-reveal-phrase
      v-model="isOpenSign"
      :is-unlock="true"
      v-bind="$attrs"
      @action:recovery-phrase="displayMnemonic"
    />

    <div
      v-if="showMnemonic"
      class="fixed left-0 top-0 z-[105] flex h-[600px] w-[800px] items-center justify-center"
    >
      <div
        class="absolute inset-0 z-[106] bg-black/[0.32]"
        @click="closeMnemonic"
      />
      <div
        class="relative z-[107] h-[568px] w-[460px] overflow-x-hidden rounded-12 bg-background-alternative pb-4 shadow-[0px_3px_6px_rgba(0,0,0,0.039),0px_7px_24px_rgba(0,0,0,0.19)]"
      >
        <settings-recovery
          :has-back="false"
          :mnemonic="mnemonic"
          @window:back="closeMnemonic"
          @window:close="closeMnemonic"
        />
      </div>
    </div>
  </main>
</template>
<script setup lang="ts">
import ModalRevealPhrase from '@action/views/modal-reveal-phrase/ModalRevealPhrase.vue';
import SettingsRecovery from '@/ui/action/modules/settings/views/SettingsViewRecovery.vue';
import appLogo from '@/assets/images/logo.svg';
import AppBtn from '@common/components/buttons/AppBtn.vue';
import AppIcon from '@common/components/icon/AppIcon.vue';
import { MnemonicWithExtraWord } from '@enkryptcom/types';
import { ref } from 'vue';

defineProps({
  isInitialized: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  isAddressRestricted: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  restrictedAddress: {
    type: String,
    default: () => {
      return '';
    },
  },
});

const emit = defineEmits<{
  (e: 'restricted:switchAccount'): void;
}>();

const supportAction = () => {
  window.open('mailto:support@myetherwallet.com', '_blank', 'noopener');
};

const isOpenSign = ref(false);
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
</script>
