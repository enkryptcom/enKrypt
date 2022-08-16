<template>
  <div>
    <settings-inner-header v-bind="$attrs" :is-general="true" />
    <!-- <base-select
      :select="selecCurrency"
      title="Currency"
      :value="currency"
      :list="currencyList"
    ></base-select> -->

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
import { onMounted, ref } from "vue";
import SettingsInnerHeader from "@action/views/settings/components/settings-inner-header.vue";
// import BaseSelect from "@action/components/base-select/index.vue";
import SettingsSwitch from "@action/views/settings/components/settings-switch.vue";
import SettingsState from "@/libs/settings-state";
import { SettingsType } from "@/libs/settings-state/types";

const settingsState = new SettingsState();
const isEthereumDisabled = ref(false);
const isPolkadotjsDisabled = ref(false);
onMounted(async () => {
  const allSettings: SettingsType = await settingsState.getAllSettings();
  isEthereumDisabled.value = allSettings.evm.inject.disabled;
  isPolkadotjsDisabled.value = !allSettings.substrate.injectPolkadotjs;
});
const toggleEthereumDisable = async (isChecked: boolean) => {
  const evmSettings = await settingsState.getEVMSettings();
  evmSettings.inject = {
    disabled: isChecked,
    timestamp: new Date().getTime(),
  };
  await settingsState.setEVMSettings(evmSettings);
};
const togglePjsDisable = async (isChecked: boolean) => {
  const subSettings = await settingsState.getSubstrateSettings();
  subSettings.injectPolkadotjs = !isChecked;
  await settingsState.setSubstrateSettings(subSettings);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

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
