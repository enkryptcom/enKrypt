<template>
  <div class="backup-detected">
    <h3>Found backup</h3>

    <div class="backup-detected__backups">
      <h4>Please choose a backup to use:</h4>
      <div class="backup-detected__backup-items-container">
        <a
          v-for="backup in backups"
          :key="backup.userId"
          @click="selectBackup(backup)"
          :class="[
            { selected: selectedBackup === backup },
            'backup-detected__backup-item',
          ]"
        >
          {{ new Date(backup.updatedAt).toLocaleString() }}
        </a>
      </div>
    </div>
    <base-button
      :title="backupBtnText"
      :disabled="backupBtnDisabled"
      :click="useBackup"
    />
    <base-button
      style="margin-top: 10px"
      no-background
      :disabled="processing"
      title="Skip"
      :click="skip"
    />
  </div>
</template>
<script setup lang="ts">
import BaseButton from '@action/components/base-button/index.vue';
import { computed, onBeforeMount, ref } from 'vue';
import { useRestoreStore } from './store';
import KeyRing from '@/libs/keyring/keyring';
import EthereumNetworks from '@/providers/ethereum/networks';
import { WalletType } from '@enkryptcom/types';
import BackupState from '@/libs/backup-state';
import { BackupType } from '@/libs/backup-state/types';
import { useRouter } from 'vue-router';
import { routes } from '../restore-wallet/routes';

const selectedBackup = ref<BackupType>();
const backups = ref<BackupType[]>([]);
const store = useRestoreStore();
const router = useRouter();
const backupState = new BackupState();
const kr = new KeyRing();
const password = store.password;
const backupBtnText = ref('Use backup');

const processing = ref(false);

const backupBtnDisabled = computed(() => {
  return !selectedBackup.value || processing.value;
});
onBeforeMount(async () => {
  await kr.unlock(password);
  await backupState.getMainWallet().catch(async () => {
    await kr.saveNewAccount({
      basePath: EthereumNetworks.ethereum.basePath,
      name: 'EVM Account 1',
      signerType: EthereumNetworks.ethereum.signer[0],
      walletType: WalletType.mnemonic,
    });
  });
  const mainWallet = await backupState.getMainWallet();
  backups.value = await backupState.getBackups(mainWallet.publicKey);
});

const selectBackup = (backup: BackupType) => {
  selectedBackup.value = backup;
};
const useBackup = async () => {
  if (selectedBackup.value) {
    backupBtnText.value = 'Restoring backup...';
    processing.value = true;
    await backupState
      .restoreBackup(selectedBackup.value, password)
      .then(() => {
        router.push({
          name: routes.walletReady.name,
        });
      })
      .catch(() => {
        backupBtnText.value = 'Failed to restore backup';
        processing.value = false;
        selectedBackup.value = undefined;
      });
  }
};

const skip = () => {
  router.push({
    name: routes.walletReady.name,
  });
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.selected {
  background: @default;
  border-radius: 10px;
}
.backup-detected {
  width: 100%;

  &__logo {
    margin-bottom: 24px;
  }

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 34px;
    line-height: 40px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    margin: 0 0 24px 0;
  }
  h4 {
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0 0 8px 0;
  }

  &__backup-items-container {
    height: 150px;
  }

  &__backup-item {
    height: 50px;
    padding: 0 16px;
    display: flex;
    font-size: 16px;
    align-items: center;
    justify-content: center;
  }

  &__backups {
    margin-bottom: 24px;

    h4 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @secondaryLabel;
      margin: 0 0 8px 0;
    }

    &-wrap {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;

      a {
        display: block;
        margin-right: 24px;
      }
    }
  }
}
</style>
