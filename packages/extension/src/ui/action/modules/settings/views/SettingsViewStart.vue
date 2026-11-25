<template>
  <div class="flex flex-col gap-6">
    <!-- PREFERENCES -->
    <section class="flex flex-col gap-6">
      <h4 class="text-overline font-bold text-text-subtle">Preferences</h4>
      <settings-row
        icon="banknotes"
        label="Currency"
        @click="$emit('action:currency')"
      >
        <template #value>
          <img
            v-if="selectedCurrencyImg"
            :src="selectedCurrencyImg"
            alt=""
            class="size-5 shrink-0 rounded-full object-cover"
          />
          <span class="text-text-sm text-text-subtle">
            {{ currentSelectedCurrency }}
          </span>
        </template>
      </settings-row>
      <settings-row
        icon="cloud-arrow-up"
        label="Settings backup"
        description="Save your current list of accounts across all networks, so you don't need to re-generate them."
        @click="$emit('action:backups')"
      />
    </section>

    <div class="h-px w-full bg-background-default-hover" />

    <!-- DAPP CONNECTIONS -->
    <section class="flex flex-col gap-6">
      <h4 class="text-overline font-bold text-text-subtle">Dapp injections</h4>
      <settings-row
        icon="bolt"
        label="Ethereum injection"
        description="Turn off to pause MEW interactions with Ethereum DApps for 1 hour, if you are using other web3 extensions"
        :interactive="false"
      >
        <template #trailing>
          <app-toggle
            :model-value="isEthereumEnabled"
            aria-label="Ethereum injection"
            @update:model-value="toggleEthereum"
          />
        </template>
      </settings-row>
      <settings-row
        icon="puzzle-piece"
        label="Polkadot-js injection"
        description="Turn off to prevent conflicts with the Polkadot-js extension"
        :interactive="false"
      >
        <template #trailing>
          <app-toggle
            :model-value="isPolkadotjsEnabled"
            aria-label="Polkadot-js injection"
            @update:model-value="togglePolkadotjs"
          />
        </template>
      </settings-row>
      <settings-row
        icon="cube"
        label="Unisat injection"
        description="Turn on to let MEW act like the Unisat wallet for DApps"
        :interactive="false"
      >
        <template #trailing>
          <app-toggle
            :model-value="isUnisatEnabled"
            aria-label="Unisat injection"
            @update:model-value="toggleUnisat"
          />
        </template>
      </settings-row>
    </section>

    <div class="h-px w-full bg-background-default-hover" />

    <!-- SECURITY -->
    <section class="flex flex-col gap-6">
      <h4 class="text-overline font-bold text-text-subtle">Security</h4>
      <settings-row
        icon="circle-stack"
        label="Analytics"
        description="MEW uses Amplitude events to improve app experience. No identifiable information is collected."
        :interactive="false"
      >
        <template #trailing>
          <app-toggle
            :model-value="isMetricsEnabled"
            aria-label="Usage analytics"
            @update:model-value="toggleMetricsEnabled"
          />
        </template>
      </settings-row>
      <settings-row
        icon="key"
        label="View my recovery phrase"
        @click="isOpenSign = true"
      />
      <settings-row
        icon="trash"
        label="Reset wallet"
        is-error
        trailing="none"
        @click="$emit('action:reset')"
      />
    </section>

    <div class="h-px w-full bg-background-default-hover" />

    <!-- SUPPORT -->
    <section class="flex flex-col gap-6">
      <h4 class="text-overline font-bold text-text-subtle">Support</h4>
      <settings-row
        icon="lifebuoy"
        label="Contact support"
        trailing="external"
        @click="$emit('action:support')"
      />
      <settings-row
        icon="bug-ant"
        label="Bug bounty program"
        trailing="external"
        @click="openLink('https://hackerone.com/myetherwallet?type=team')"
      />
      <settings-row
        icon="shield-check"
        label="Privacy and terms"
        trailing="external"
        @click="openLink('https://www.myetherwallet.com/privacy-policy')"
      />
    </section>

    <div class="h-px w-full bg-background-default-hover" />

    <!-- ABOUT -->
    <section class="flex flex-col gap-6">
      <h4 class="text-overline font-bold text-text-subtle">About</h4>
      <settings-row
        icon="globe-alt"
        label="Visit our website"
        trailing="external"
        @click="openLink('https://www.enkrypt.com/')"
      />
      <settings-row
        icon="paper-airplane"
        label="Join us on Telegram"
        trailing="external"
        @click="openLink('https://t.me/myetherwallet')"
      />
      <settings-row
        icon="at-symbol"
        label="Follow us on Twitter"
        trailing="external"
        @click="openLink('https://twitter.com/enkrypt')"
      />
      <settings-row
        icon="chat-bubble-bottom-center-text"
        label="Follow us on Discord"
        trailing="external"
        @click="openLink('https://discord.com/invite/Gz8vBneyKe')"
      />
    </section>

    <div class="text-center text-text-xs text-text-muted">
      <p>Version {{ version }} ({{ buildTime }})</p>
      <p>© {{ new Date().getFullYear() }} by MyEtherWallet Inc.</p>
    </div>

    <modal-reveal-phrase
      v-model="isOpenSign"
      :is-unlock="true"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import AppToggle from '@common/components/buttons/AppToggle.vue';
import SettingsRow from '@action/modules/settings/components/settings-row.vue';
import ModalRevealPhrase from '@action/views/modal-reveal-phrase/ModalRevealPhrase.vue';
import SettingsState from '@/libs/settings-state';
import { optOutofMetrics } from '@/libs/metrics';
import { useCurrencyStore } from '@action/store/currency-store';

// `action:recovery-phrase` comes from ModalRevealPhrase through $attrs.
defineOptions({ inheritAttrs: false });

defineEmits<{
  (e: 'action:currency'): void;
  (e: 'action:backups'): void;
  (e: 'action:reset'): void;
  (e: 'action:support'): void;
}>();

const version = __PACKAGE_VERSION__;
const buildTime = __BUILD_TIME__;

const isOpenSign = ref(false);

const { currentSelectedCurrency, currencyList } =
  storeToRefs(useCurrencyStore());
const selectedCurrencyImg = computed(
  () =>
    currencyList.value.find(
      c => c.fiat_currency === currentSelectedCurrency.value,
    )?.img,
);

const openLink = (url: string) => window.open(url, '_blank', 'noopener');

// General settings: each toggle writes straight to SettingsState. Every
// injection toggle reads "on = injected"; the stored flags are mapped here.
const settingsState = new SettingsState();
const isEthereumEnabled = ref(true);
const isPolkadotjsEnabled = ref(true);
const isUnisatEnabled = ref(true);
const isMetricsEnabled = ref(true);

onMounted(async () => {
  const allSettings = await settingsState.getAllSettings();
  isEthereumEnabled.value = !allSettings.evm.inject.disabled;
  isPolkadotjsEnabled.value = allSettings.substrate.injectPolkadotjs;
  isUnisatEnabled.value = allSettings.btc.injectUnisat;
  isMetricsEnabled.value = allSettings.enkrypt.isMetricsEnabled;
});

// Turning Ethereum off is a timed pause: the timestamp starts the 1-hour window.
const toggleEthereum = async (isEnabled: boolean) => {
  const evmSettings = await settingsState.getEVMSettings();
  evmSettings.inject = { disabled: !isEnabled, timestamp: Date.now() };
  await settingsState.setEVMSettings(evmSettings);
  isEthereumEnabled.value = isEnabled;
};

const togglePolkadotjs = async (isEnabled: boolean) => {
  const subSettings = await settingsState.getSubstrateSettings();
  subSettings.injectPolkadotjs = isEnabled;
  await settingsState.setSubstrateSettings(subSettings);
  isPolkadotjsEnabled.value = isEnabled;
};

const toggleUnisat = async (isEnabled: boolean) => {
  const btcSettings = await settingsState.getBtcSettings();
  btcSettings.injectUnisat = isEnabled;
  await settingsState.setBtcSettings(btcSettings);
  isUnisatEnabled.value = isEnabled;
};

const toggleMetricsEnabled = async (isEnabled: boolean) => {
  const enkryptSettings = await settingsState.getEnkryptSettings();
  enkryptSettings.isMetricsEnabled = isEnabled;
  await settingsState.setEnkryptSettings(enkryptSettings);
  optOutofMetrics(!isEnabled);
  isMetricsEnabled.value = isEnabled;
};
</script>
