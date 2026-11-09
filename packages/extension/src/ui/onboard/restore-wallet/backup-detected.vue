<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-heading-2xl mt-3">Found backup</h1>

    <div class="flex flex-col gap-2">
      <p class="text-text-sm text-text-subtle">
        Please choose a backup to use:
      </p>
      <div
        class="flex h-[300px] flex-col gap-1 overflow-y-auto rounded-12 bg-background-default p-2"
      >
        <template v-if="!loadingBackups">
          <button
            v-for="backup in backups"
            :key="backup.userId"
            type="button"
            :aria-pressed="selectedBackup === backup"
            :class="[
              'flex w-full items-center gap-3 rounded-8 p-3 text-left transition-colors hover:bg-background-default-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
              {
                'inset-ring-2 inset-ring-border-brand':
                  selectedBackup === backup,
              },
            ]"
            @click="selectBackup(backup)"
          >
            <backup-identicon :hash="backup.userId" />
            <span class="flex flex-col">
              <span class="text-text-base text-text-default">{{
                generateRandomNameWithSeed(' ', backup.userId)
              }}</span>
              <span class="text-text-sm text-text-muted">{{
                formatDate(backup.updatedAt)
              }}</span>
            </span>
          </button>
        </template>
        <template v-else>
          <div
            v-for="idx in 3"
            :key="idx"
            class="flex flex-col gap-1.5 p-3 animate-pulse"
            aria-hidden="true"
          >
            <div class="bg-background-default-hover h-4 w-[150px] rounded-4" />
            <div class="bg-background-default-hover h-3 w-[100px] rounded-4" />
          </div>
        </template>
      </div>
    </div>

    <app-btn
      size="large"
      :disabled="backupBtnDisabled"
      :is-loading="processing"
      @click="useBackup"
      >{{ backupBtnText }}</app-btn
    >
    <app-btn size="large" type="tertiary" :disabled="processing" @click="skip"
      >Skip</app-btn
    >

    <p class="text-text-sm text-text-subtle">
      Enkrypt creates backups of generated user accounts, derivation paths, and
      account names across all networks to make it easier to restore your
      wallet.
      <a
        href="https://help.myetherwallet.com/en/articles/6437190-enkrypt-add-and-import-accounts-and-connect-a-hardware-wallet#h_62bd285c76"
        target="_blank"
        rel="noopener noreferrer"
        class="text-text-brand hover:underline"
        >Learn more</a
      >
    </p>
  </div>
</template>
<script setup lang="ts">
import AppBtn from '@components/buttons/AppBtn.vue';
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
