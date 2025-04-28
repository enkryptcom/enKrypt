<template>
  <div class="backup-detected">
    <h3>Found backup</h3>

    <div class="backup-detected__backups">
      <h4>Please choose a backup to use:</h4>
      <div
        class="backup-detected__backup-items-container"
        v-if="!loadingBackups"
      >
        <a
          v-for="backup in backups"
          :key="backup.userId"
          @click="selectBackup(backup)"
          :class="[
            { selected: selectedBackup === backup },
            'backup-detected__backup-item',
          ]"
        >
          <backup-identicon :hash="backup.userId" />
          <div class="backup-detected__backup-item__name">
            <h4>{{ generateRandomNameWithSeed(' ', backup.userId) }}</h4>
            <p>{{ formatDate(backup.updatedAt) }}</p>
          </div>
        </a>
      </div>
      <div class="backup-detected__backup-items-container" v-else>
        <a
          v-for="(backup, idx) in [1, 2, 3]"
          :key="`entity-${backup}-${idx}`"
          class="backup-detected__backup-item-loading"
        >
          <div class="backup-detected__backup-item-loading__loading-container">
            <balance-loader />
            <balance-loader />
          </div>
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

    <div class="backup-detected__details">
      Enkrypt creates backups of generated user accounts, derivation paths, and
      account names across all networks to make it easier to restore your
      wallet.
      <a
        href="https://help.myetherwallet.com/en/articles/6437190-enkrypt-add-and-import-accounts-and-connect-a-hardware-wallet#h_62bd285c76"
        target="_blank"
        >Learn more</a
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import BaseButton from '@action/components/base-button/index.vue';
import { computed, onBeforeMount, ref, unref } from 'vue';
import { useRestoreStore } from './store';
import KeyRing from '@/libs/keyring/keyring';
import EthereumNetworks from '@/providers/ethereum/networks';
import { WalletType } from '@enkryptcom/types';
import BackupState from '@/libs/backup-state';
import { ListBackupType } from '@/libs/backup-state/types';
import { useRouter } from 'vue-router';
import { routes } from '../restore-wallet/routes';
import { generateRandomNameWithSeed } from '@enkryptcom/utils';
import backupIdenticon from '@/ui/action/views/settings/views/settings-backups/backup-identicon.vue';
import BalanceLoader from '@action/icons/common/balance-loader.vue';

const selectedBackup = ref<ListBackupType>();
const backups = ref<ListBackupType[]>([]);
const store = useRestoreStore();
const router = useRouter();
const backupState = new BackupState();
const kr = new KeyRing();
const password = store.password;
const backupBtnText = ref('Use backup');

const processing = ref(false);
const loadingBackups = ref(true);

const backupBtnDisabled = computed(() => {
  return !selectedBackup.value || processing.value;
});
onBeforeMount(async () => {
  await kr.unlock(unref(password));
  await backupState.getMainWallet().catch(async () => {
    await kr.saveNewAccount({
      basePath: EthereumNetworks.ethereum.basePath,
      name: 'EVM Account 1',
      signerType: EthereumNetworks.ethereum.signer[0],
      walletType: WalletType.mnemonic,
    });
  });
  const mainWallet = await backupState.getMainWallet();
  const sigHash = backupState.getListBackupMsgHash(mainWallet.publicKey);
  const signature = await kr.sign(sigHash as `0x${string}`, {
    basePath: EthereumNetworks.ethereum.basePath,
    signerType: EthereumNetworks.ethereum.signer[0],
    pathIndex: 0,
    walletType: WalletType.mnemonic,
  });
  backups.value = await backupState.listBackups({
    pubkey: mainWallet.publicKey,
    signature,
  });
  kr.lock();
  loadingBackups.value = false;
});

const selectBackup = (backup: ListBackupType) => {
  selectedBackup.value = backup;
};
const useBackup = async () => {
  if (selectedBackup.value) {
    backupBtnText.value = 'Restoring backup...';
    processing.value = true;
    await backupState
      .restoreBackup(selectedBackup.value.userId, unref(password))
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

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
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
  border: 1px solid @primary !important;
  border-radius: 10px;
  color: @white;
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
    margin: 0 0 12px 0;
  }
  h4 {
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0 0 8px 0;
  }

  &__details {
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    font-size: 16px;
    color: @secondaryLabel;
    margin-top: 10px;
    padding: 20px;
    border-radius: 12px;
    background: white;

    a {
      color: @primary;
    }
  }

  &__backup-items-container {
    padding: 16px;
    min-height: 150px;
    max-height: 300px;
    overflow-y: auto;
    background: @white;
    border-radius: 8px;
  }

  &__backup-item {
    margin: 4px;
    padding: 16px;
    display: flex;
    font-size: 16px;
    align-items: center;
    cursor: pointer;
    border: 1px solid @white;

    &:hover {
      border: 1px solid @primary;
      border-radius: 10px;
    }

    &__name {
      margin-left: 10px;

      h4 {
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
        color: #202124;
        margin: 0 0 1px 0 !important;
      }

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        color: @tertiaryLabel;
        margin: 0;
      }
    }
  }

  &__backup-item-loading {
    margin: 4px;
    padding: 16px;
    display: flex;
    font-size: 16px;
    align-items: center;
    border: 1px solid @white;
    cursor: not-allowed;

    &__loading-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;

      svg {
        width: 100px;

        &:first-child {
          width: 150px;
          margin-bottom: 5px;
        }
      }
    }

    &:hover {
      border: 1px solid @white;
      border-radius: 10px;
    }
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
