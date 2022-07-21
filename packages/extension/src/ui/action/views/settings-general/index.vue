<template>
  <div>
    <settings-inner-header
      v-bind="$attrs"
      :is-general="true"
    ></settings-inner-header>
    <base-select
      :select="selecCurrency"
      title="Currency"
      :value="currency"
      :list="currencyList"
    ></base-select>

    <settings-switch
      :action="zeroBalancesAction"
      title="Hide zero balances"
      :is-active="isHideZeroBalance"
    ></settings-switch>

    <base-select
      :select="selecTimer"
      title="Auto-lock timer"
      :value="timer"
      :list="timerList"
    ></base-select>

    <div class="settings__label">
      <p>Set the idle time in minutes before Enkrypt will become locked.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SettingsInnerHeader from "@action/views/settings/components/settings-inner-header.vue";
import BaseSelect from "@action/components/base-select/index.vue";
import SettingsSwitch from "@action/views/settings/components/settings-switch.vue";

const currencyList = [
  "US Dollar",
  "Australian Dollar",
  "Euro",
  "Russian Ruble",
];
const currency = ref("US Dollar");
const isHideZeroBalance = ref(false);
const timerList = ["1 min", "5 min", "15 min"];
const timer = ref("5 min");

const selecCurrency = (value: string) => {
  currency.value = value;
};

const zeroBalancesAction = (isChecked: boolean) => {
  isHideZeroBalance.value = isChecked;
};

const selecTimer = (value: string) => {
  timer.value = value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.settings {
  &__label {
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

  &__wrap {
    .base-select__container {
      margin-bottom: 12px;
    }
  }
}
</style>
