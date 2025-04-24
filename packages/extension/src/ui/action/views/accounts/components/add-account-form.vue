<template>
  <app-dialog
    v-model="model"
    width="344px"
    is-centered
    @close:dialog="closeWindow"
  >
    <div class="add-account-form">
      <h3>Add new {{ network.name_long }} account</h3>

      <div class="add-account-form__input" :class="{ focus: isFocus }">
        <img
          v-if="newAccount?.address"
          :src="network.identicon(network.displayAddress(newAccount.address))"
        />
        <input
          ref="addAccountInput"
          v-model="accountName"
          type="text"
          placeholder="Account name"
          autocomplete="off"
          autofocus
          @focus="changeFocus"
          @blur="changeFocus"
        />
      </div>

      <p>
        Name your account something that makes sense to you! Main account, dapp
        account, yolo account, etc.
      </p>

      <div class="add-account-form__buttons">
        <div class="add-account-form__buttons-cancel">
          <base-button
            title="Cancel"
            :click="closeWindow"
            :no-background="true"
          />
        </div>
        <div class="add-account-form__buttons-send">
          <base-button
            title="Add account"
            :click="addAccount"
            :disabled="isDisabled"
          />
        </div>
      </div>
    </div>
  </app-dialog>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref, watch } from 'vue';
import BaseButton from '@action/components/base-button/index.vue';
import { NodeType } from '@/types/provider';
import { sendToBackgroundFromAction } from '@/libs/messenger/extension';
import { InternalMethods } from '@/types/messenger';
import { EnkryptAccount, KeyRecordAdd, WalletType } from '@enkryptcom/types';
import Keyring from '@/libs/keyring/public-keyring';
import BackupState from '@/libs/backup-state';
import AppDialog from '@action/components/app-dialog/index.vue';

const model = defineModel<boolean>();

const isFocus = ref(false);
const accountName = ref('');
const newAccount = ref<EnkryptAccount | null>(null);
const isDisabled = ref(true);
const addAccountInput = ref(null);

defineExpose({ addAccountInput });
const emit = defineEmits<{
  (e: 'update:init'): void;
}>();

const closeWindow = () => {
  model.value = false;
};
const props = defineProps({
  network: {
    type: Object as PropType<NodeType>,
    default: () => ({}),
  },
});
const kr = new Keyring();
const setNewAccountInfo = async () => {
  const keyReq: KeyRecordAdd = {
    name: '',
    basePath: props.network.basePath,
    signerType: props.network.signer[0],
    walletType: WalletType.mnemonic,
  };
  await sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.getNewAccount,
      params: [keyReq],
    }),
  }).then(res => {
    if (res.result) {
      newAccount.value = JSON.parse(res.result) as EnkryptAccount;
    }
  });
};

watch(
  () => model.value,
  async () => {
    if (model.value) {
      accountName.value = '';
      setNewAccountInfo();
      if (addAccountInput.value) {
        (addAccountInput.value as HTMLInputElement).focus();
      }
    }
  },
);

watch(accountName, async () => {
  isDisabled.value = false;
  if (accountName.value.length < 3) return (isDisabled.value = true);
  const allNames = await kr.getAccounts().then(all => all.map(a => a.name));
  if (allNames.includes(accountName.value.trim())) isDisabled.value = true;
});
const changeFocus = () => {
  isFocus.value = !isFocus.value;
};
const addAccount = async () => {
  const keyReq: KeyRecordAdd = {
    name: accountName.value.trim(),
    basePath: props.network.basePath,
    signerType: props.network.signer[0],
    walletType: WalletType.mnemonic,
  };
  await sendToBackgroundFromAction({
    message: JSON.stringify({
      method: InternalMethods.saveNewAccount,
      params: [keyReq],
    }),
  }).then(() => {
    const backupState = new BackupState();
    backupState.backup(false).catch(() => {
      console.error('Failed to backup');
    });
    emit('update:init');
    closeWindow();
  });
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
.add-account-form {
  padding: 16px;
  height: auto;

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 32px;
    color: @primaryLabel;
    margin: 0 0 16px 0;
    max-width: 280px;
  }
  p {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @tertiaryLabel;
    margin: 0 0 20px 0;
  }
  &__input {
    width: 312px;
    height: 56px;
    border: 2px solid @gray02;
    border-radius: 10px;
    padding: 12px;
    display: flex;
    box-sizing: border-box;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    margin-bottom: 16px;
    &.focus {
      border: 2px solid @primary;
    }
    img {
      width: 32px;
      height: 32px;
      margin-right: 12px;
      border-radius: 50%;
    }
    input {
      width: 100%;
      font-style: normal;
      font-weight: normal;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      border: 0 none;
      outline: none;
    }
  }
  &__buttons {
    display: flex;
    justify-content: justify-space-between;
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
