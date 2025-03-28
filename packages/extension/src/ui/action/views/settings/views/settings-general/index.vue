<template>
  <div>
    <settings-inner-header v-bind="$attrs" :is-general="true" />
    <settings-select
      :select="selectCurrency"
      title="Currency"
      :value="currentSelectedCurrency"
      :list="currencyList"
    ></settings-select>
    <div class="settings__label">
      <p>Select your preferred currency</p>
    </div>

    <settings-switch
      title="Turn off Ethereum for 1 hour"
      :is-checked="isEthereumDisabled"
      @update:check="toggleEthereumDisable"
    />
    <div class="settings__label">
      <p>
        Pause Enkrypt interactions with Ethereum DApps if you are using other
        web3 extensions
      </p>
    </div>

    <settings-switch
      title="Turn off Polkadot-js injection"
      :is-checked="isPolkadotjsDisabled"
      @update:check="togglePjsDisable"
    />
    <div class="settings__label">
      <p>Prevent conflict with Polkadot-js extension</p>
    </div>

    <settings-switch
      title="Turn on Unisat injection"
      :is-checked="isUnisatEnabled"
      @update:check="toggleUnisatEnable"
    />
    <div class="settings__label">
      <p>Enable Enkrypt act like Unisat wallet for dapps</p>
    </div>

    <settings-switch
      title="Disable Amplitude Events"
      :is-checked="!isMetricsEnabled"
      @update:check="toggleMetricsEnabled"
    />
    <div class="settings__label">
      <p>
        MEW uses Amplitude events to improve Enkrypt. No identifiable
        information is collected.
      </p>
    </div>
    <settings-button title="Settings backup" @click="$emit('open:backups')" />
    <div class="settings__label">
      <p>
        Save your current list of accounts across all networks, so you don't
        need to re-generate them.
      </p>
    </div>
    <!-- <base-select
      :select="selecTimer"
      title="Auto-lock timer"
      :value="timer"
      :list="timerList"
    ></base-select> -->

    <!-- <div class="settings__label">
      <p>Set the idle time in minutes before Enkrypt will become locked.</p>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import SettingsInnerHeader from '@action/views/settings/components/settings-inner-header.vue';
// import BaseSelect from '@action/components/base-select/index.vue';
import SettingsSelect from '@action/views/settings/components/settings-select.vue';
import SettingsButton from '@action/views/settings/components/settings-button.vue';
import SettingsSwitch from '@action/views/settings/components/settings-switch.vue';
import SettingsState from '@/libs/settings-state';
import { SettingsType } from '@/libs/settings-state/types';
import { optOutofMetrics } from '@/libs/metrics';
import { useCurrencyStore } from '../../store';
import { storeToRefs } from 'pinia';

const settingsState = new SettingsState();
const isEthereumDisabled = ref(false);
const isPolkadotjsDisabled = ref(false);
const isUnisatEnabled = ref(true);
const isMetricsEnabled = ref(true);

const store = useCurrencyStore();
const { setSelectedCurrency } = store;
const { currentSelectedCurrency, currencyList } = storeToRefs(store);
defineEmits<{ (e: 'open:backups'): void }>();

onMounted(async () => {
  const allSettings: SettingsType = await settingsState.getAllSettings();
  isEthereumDisabled.value = allSettings.evm.inject.disabled;
  isPolkadotjsDisabled.value = !allSettings.substrate.injectPolkadotjs;
  isUnisatEnabled.value = allSettings.btc.injectUnisat;
  isMetricsEnabled.value = allSettings.enkrypt.isMetricsEnabled;
});
const toggleEthereumDisable = async (isChecked: boolean) => {
  const evmSettings = await settingsState.getEVMSettings();
  evmSettings.inject = { disabled: isChecked, timestamp: new Date().getTime() };
  await settingsState.setEVMSettings(evmSettings);
  isEthereumDisabled.value = isChecked;
};
const selectCurrency = async (currency: string) => {
  setSelectedCurrency(currency);
};
const togglePjsDisable = async (isChecked: boolean) => {
  const subSettings = await settingsState.getSubstrateSettings();
  subSettings.injectPolkadotjs = !isChecked;
  await settingsState.setSubstrateSettings(subSettings);
  isPolkadotjsDisabled.value = isChecked;
};
const toggleUnisatEnable = async (isChecked: boolean) => {
  const btcSettings = await settingsState.getBtcSettings();
  btcSettings.injectUnisat = isChecked;
  await settingsState.setBtcSettings(btcSettings);
  isUnisatEnabled.value = isChecked;
};
const toggleMetricsEnabled = async (isChecked: boolean) => {
  const enkryptSettings = await settingsState.getEnkryptSettings();
  enkryptSettings.isMetricsEnabled = !isChecked;
  await settingsState.setEnkryptSettings(enkryptSettings);
  optOutofMetrics(isChecked);
  isMetricsEnabled.value = !isChecked;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.settings {
  &__label {
    padding: 0 48px;
    margin-bottom: 10px;
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

  &__wrap {
    .base-select__container {
      margin-bottom: 12px;
    }
  }
}
</style>
