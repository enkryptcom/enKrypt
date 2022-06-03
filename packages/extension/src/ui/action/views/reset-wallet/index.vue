<template>
  <div class="reset-wallet">
    <settings-inner-header
      :back="back"
      :close="close"
      :is-reset="true"
    ></settings-inner-header>
    <div class="reset-wallet__wrap">
      <p class="reset-wallet__description">
        Resetting wallet will remove all keys from Enkrypt and you won’t be able
        to use wallet until you restore it once again.
      </p>

      <div class="reset-wallet__alert">
        <alert-icon />
        <p>
          Warning: you can lose your account and funds forever. Don’t reset if
          you didn’t saved your secret recovery phrase, as there will be NO WAY
          to restore your account after you reset.
        </p>
      </div>

      <label class="reset-wallet__label"
        >Type ‘Reset’ to reset your wallet</label
      >

      <base-input
        type="text"
        placeholder="Type Reset"
        class="reset-wallet__input"
        :value="reset"
        @update:value="resetChanged"
      />

      <base-button
        title="Reset wallet"
        :click="resetAction"
        :red="true"
        :disabled="isDisabled"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "ResetWallet",
};
</script>

<script setup lang="ts">
import { PropType, ref, computed } from "vue";
import SettingsInnerHeader from "@action/views/settings/components/settings-inner-header.vue";
import AlertIcon from "@action/icons/send/alert-icon.vue";
import BaseButton from "@action/components/base-button/index.vue";
import BaseInput from "@action/components/base-input/index.vue";

const reset = ref("");

defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  back: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});

const resetChanged = (newVal: string) => {
  reset.value = newVal;
};

const isDisabled = computed(() => {
  return reset.value !== "reset";
});

const resetAction = () => {
  console.log("resetAction");
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.reset-wallet {
  &__wrap {
    padding: 0 32px;
    position: relative;
    height: 100%;
  }
  &__description {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0 0 12px 0;
  }

  &__alert {
    background: @error01;
    border-radius: 10px;
    padding: 12px 16px 12px 56px;
    position: relative;
    box-sizing: border-box;
    margin: 0 0 28px 0;

    svg {
      position: absolute;
      left: 16px;
      top: 50%;
      margin-top: -12px;
    }

    p {
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @error;
      margin: 0;

      a {
        color: @error;

        &:hover {
          text-decoration: none;
        }
      }
    }
  }

  &__label {
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: @primaryLabel;
    margin: 0 0 8px 0;
    display: block;
  }

  &__input {
    margin: 0 0 152px 0;
  }
}
</style>
