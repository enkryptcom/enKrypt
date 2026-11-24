<template>
  <div>
    <div class="pb-3 flex flex-col gap-1">
      <settings-button title="General" @click="$emit('action:general')" />
      <settings-button
        title="Contact support"
        :is-link="true"
        @click="contactSupport"
      />
    </div>

    <div class="w-full h-px bg-border-default" />

    <div class="py-3 flex flex-col gap-1">
      <settings-button
        title="Bug bounty program"
        :is-link="true"
        @click="bugAction"
      />
      <settings-button
        title="Privacy and terms"
        :is-link="true"
        @click="privacyAction"
      />
      <settings-button title="About" @click="$emit('action:about')" />
    </div>

    <div class="w-full h-px bg-border-default" />

    <div class="py-3 flex flex-col gap-1">
      <settings-button title="View my recovery phrase" @click="toggleSign" />
      <settings-button
        title="Reset wallet"
        :is-red="true"
        @click="$emit('action:reset')"
      />
    </div>

    <div
      class="text-text-xs leading-4 tracking-[0.5px] text-text-muted text-center mt-4"
    >
      <p>Version {{ version }} ({{ buildTime }})</p>
      <p>© {{ new Date().getFullYear() }} by MyEtherWallet Inc.</p>
    </div>

    <modal-sign v-model="isOpenSign" :is-unlock="true" v-bind="$attrs" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SettingsButton from '@action/components/settings/components/settings-button.vue';
import ModalSign from '@action/views/modal-sign/index.vue';

const isOpenSign = ref(false);
const version = __PACKAGE_VERSION__;
const buildTime = __BUILD_TIME__;
defineEmits<{
  (e: 'action:reset'): void;
  (e: 'action:support'): void;
  (e: 'action:general'): void;
  (e: 'action:about'): void;
}>();

const bugAction = () => {
  window.open(
    'https://hackerone.com/myetherwallet?type=team',
    '_blank',
    'noopener',
  );
};

const privacyAction = () => {
  window.open(
    'https://www.myetherwallet.com/privacy-policy',
    '_blank',
    'noopener',
  );
};

const contactSupport = () => {
  window.open(
    'https://www.enkrypt.com/?ref=enkrypt_help',
    '_blank',
    'noopener',
  );
};

const toggleSign = () => {
  isOpenSign.value = !isOpenSign.value;
};
</script>
