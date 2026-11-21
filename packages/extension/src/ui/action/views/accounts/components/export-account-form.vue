<template>
  <app-dialog v-model="model" width="344px" is-centered>
    <div class="export-account-form">
      <h3>Export private key</h3>

      <span v-show="!isDone">
        <h4>Enter Extension password</h4>

        <base-input
          type="password"
          placeholder="Extension Password"
          class="export-account-form__input"
          :value="keyringPassword"
          @update:value="updateKeyringPassword"
          @keyup.enter="showAction"
        />

        <p v-show="keyringError" class="export-account-form__error">
          Invalid Keyring password
        </p>

        <base-button
          class="export-account-form__button"
          title="Show"
          :click="showAction"
          :disabled="isLoading"
        />
      </span>

      <div v-if="isDone" class="privkey">
        <p class="warning">
          ⚠️ Keep your private key secure. Never share it with anyone.
        </p>
        <p class="title">Private Key:</p>
        <span class="word">{{ privKey }}</span>
      </div>
    </div>
  </app-dialog>
</template>

<script setup lang="ts">
import { PropType, ref, onMounted, computed } from 'vue';
import AppDialog from '@action/components/app-dialog/index.vue';
import BaseButton from '@action/components/base-button/index.vue';
import BaseInput from '@action/components/base-input/index.vue';
import { NodeType } from '@/types/provider';
import { EnkryptAccount } from '@enkryptcom/types';
import KeyRingBase from '@/libs/keyring/keyring';
import BackupState from '@/libs/backup-state';
import { sendToBackgroundFromAction } from '@/libs/messenger/extension';
import { InternalMethods } from '@/types/messenger';

const model = defineModel<boolean>();
const closeWindow = () => {
  model.value = false;
};
const keyringError = ref(false);
const isDone = ref(false);
const isLoading = ref(false);
const keyringPassword = ref(__PREFILL_PASSWORD__!);
const privKey = ref('');
const keyringBase = new KeyRingBase();

const props = defineProps({
  account: {
    type: Object as PropType<EnkryptAccount>,
    default: () => ({}),
  },
});

const showAction = async () => {
  try {
    isLoading.value = true;
    const res = await sendToBackgroundFromAction({
      message: JSON.stringify({
        method: InternalMethods.getPrivateKey,
        params: [props.account, keyringPassword.value],
      }),
    });
    if (res.error) {
      throw res.error;
    } else {
      privKey.value = JSON.parse(res.result!);
    }
    isDone.value = true;
  } catch (err) {
    keyringError.value = true;
  }
  isLoading.value = false;
};

const updateKeyringPassword = (password: string) => {
  keyringPassword.value = password;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
.export-account-form {
  padding: 16px;

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 32px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
  }
  &__button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    margin-top: 24px;
  }
  &__error {
    width: 100%;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    letter-spacing: 0.25px;
    color: @error;
  }

  .privkey {
    width: 100%;
    margin-top: 28px;
    .title {
      font-style: normal;
      font-weight: bold;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      margin-bottom: 6px;
    }

    .word {
      font-style: normal;
      font-weight: 400;
      font-size: 18px;
      line-height: 24px;
      color: black;
      background: @lightBg;
      border: 1px solid rgba(95, 99, 104, 0.1);
      box-sizing: border-box;
      border-radius: 10px;
      padding: 10px 16px;
      margin: 0px;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      justify-content: start;
      text-wrap: auto;
      user-select: all;
      line-break: anywhere;
    }
    .warning {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @error;
      margin: 0 0 12px 0;
    }
  }
}
</style>
