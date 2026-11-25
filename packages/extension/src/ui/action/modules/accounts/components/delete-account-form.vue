<template>
  <app-dialog v-model="model" width="344px" is-centered>
    <div class="delete-account-form">
      <h3>Delete account?</h3>

      <p>You can add it anytime</p>

      <div class="delete-account-form__buttons">
        <div class="delete-account-form__buttons-cancel">
          <base-button
            title="Cancel"
            :click="closeWindow"
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
  </app-dialog>
</template>

<script setup lang="ts">
import AppDialog from '@action/components/app-dialog/index.vue';
import KeyRingBase from '@/libs/keyring/keyring';
import BaseButton from '@action/components/base-button/index.vue';
import { EnkryptAccount } from '@enkryptcom/types';
import { PropType } from 'vue';

const model = defineModel<boolean>();
const closeWindow = () => {
  model.value = false;
};
const emit = defineEmits<{
  (e: 'update:init'): void;
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
    closeWindow();
    emit('update:init');
  });
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
.delete-account-form {
  padding: 16px;

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
