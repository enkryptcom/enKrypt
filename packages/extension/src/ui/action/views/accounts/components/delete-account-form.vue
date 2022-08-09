<template>
  <div class="delete-account-form__container">
    <div class="delete-account-form__overlay" @click="$emit('window:close')" />
    <div class="delete-account-form">
      <h3>Delete account?</h3>

      <p>You can add it anytime</p>

      <div class="delete-account-form__buttons">
        <div class="delete-account-form__buttons-cancel">
          <base-button
            title="Cancel"
            :click="() => $emit('window:close')"
            :no-background="true"
          />
        </div>
        <div class="delete-account-form__buttons-send">
          <base-button
            title="Confirm"
            :click="deleteAccount"
            :disabled="false"
            :red="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import KeyRingBase from "@/libs/keyring/keyring";
import BaseButton from "@action/components/base-button/index.vue";
import { EnkryptAccount } from "@enkryptcom/types";
import { PropType } from "vue";

const emit = defineEmits<{
  (e: "window:close"): void;
  (e: "update:init"): void;
}>();

const props = defineProps({
  account: {
    type: Object as PropType<EnkryptAccount>,
    default: () => ({}),
  },
});
const deleteAccount = () => {
  const keyring = new KeyRingBase();
  keyring.deleteAccount(props.account.address).then(() => {
    emit("window:close");
    emit("update:init");
  });
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
.delete-account-form {
  background: @white;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039), 0px 7px 24px rgba(0, 0, 0, 0.19);
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;
  width: 344px;
  height: auto;
  z-index: 107;
  position: relative;

  &__container {
    width: 800px;
    height: 600px;
    left: -340px;
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

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 32px;
    color: @primaryLabel;
    margin: 0 0 12px 0;
  }
  p {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0 0 12px 0;
  }
  &__buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    &-cancel {
      width: 132px;
    }
    &-send {
      width: 172px;
    }
  }
}
</style>
