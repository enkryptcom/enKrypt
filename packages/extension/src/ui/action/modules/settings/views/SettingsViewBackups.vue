<template>
  <div class="flex flex-col gap-6">
    <p class="text-text-sm text-text-subtle">
      Save your current list of accounts across all networks, so you don't need
      to re-generate them when you import or restore your wallet with Enkrypt.
      You will still need your recovery phrase. We only back up non-vital
      information such as account names and derivation paths. Your sensitive
      information, like your mnemonic and private keys, is never backed up.
    </p>

    <settings-row
      icon="cloud-arrow-up"
      :label="`Backup ${isBackupsEnabled ? 'on' : 'off'}`"
      :interactive="false"
    >
      <template #trailing>
        <app-toggle
          :model-value="isBackupsEnabled"
          :disabled="loading"
          aria-label="Settings backup"
          @update:model-value="toggleBackups"
        />
      </template>
    </settings-row>

    <div class="h-px w-full bg-background-default-hover" />

    <section class="flex flex-col gap-4">
      <h4 class="text-overline font-bold text-text-subtle">
        {{ listHeading }}
      </h4>

      <!-- Loading skeleton -->
      <template v-if="loading">
        <div
          v-for="item in 3"
          :key="`skeleton-${item}`"
          class="flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-2.5">
            <div class="size-8 shrink-0 rounded-full bg-background-skeleton" />
            <div class="flex flex-col gap-1.5">
              <div
                class="animate-pulse h-4 w-36 rounded-4 bg-background-skeleton"
              />
              <div
                class="animate-pulse h-3 w-24 rounded-4 bg-background-skeleton"
              />
            </div>
          </div>
          <div
            class="animate-pulse h-4 w-12 rounded-4 bg-background-skeleton"
          />
        </div>
      </template>

      <!-- Backups -->
      <ul v-else-if="backups.length" class="flex flex-col gap-4">
        <li
          v-for="(entity, index) in backups"
          :key="`entity-${entity.userId}-${index}`"
          class="flex items-center justify-between gap-3"
        >
          <div class="flex min-w-0 items-center gap-2.5">
            <backup-identicon :hash="entity.userId" class="shrink-0" />
            <div class="flex min-w-0 flex-col">
              <span class="truncate text-text-base text-text-default">
                {{ backupName(entity) }}
              </span>
              <span class="text-text-xs text-text-subtle">
                Last backup on: {{ formatDate(entity.updatedAt) }}
              </span>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-2">
            <span
              v-if="entity.userId === currentUserId"
              class="rounded-full bg-background-brand-subtle px-2 py-0.5 text-label-xs text-text-brand"
            >
              Active
            </span>
            <AppBtnIcon
              icon="trash"
              size="m"
              :label="`Delete ${backupName(entity)}`"
              @click="showDeleteBackup(entity)"
            />
          </div>
        </li>
      </ul>
    </section>

    <AppModal
      v-model="isDeleteOpen"
      title="Delete backup?"
      subtitle="This removes the backup from the server. Your wallet and accounts on this device are not affected."
      :buttons="{
        primary: {
          label: 'Delete',
          tone: 'danger',
          loading: isDeleting,
          onClick: deleteBackup,
        },
        secondary: {
          label: 'Cancel',
          onClick: () => (isDeleteOpen = false),
        },
      }"
      @closed="selectedBackup = null"
    >
      <div v-if="selectedBackup" class="flex items-center gap-2.5 px-4 sm:px-6">
        <backup-identicon :hash="selectedBackup.userId" class="shrink-0" />
        <div class="flex min-w-0 flex-col">
          <span class="truncate text-text-base text-text-default">
            {{ backupName(selectedBackup) }}
          </span>
          <span class="text-text-xs text-text-subtle">
            Last backup on: {{ formatDate(selectedBackup.updatedAt) }}
          </span>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { generateRandomNameWithSeed } from '@enkryptcom/utils';
import BackupState from '@/libs/backup-state';
import { ListBackupType } from '@/libs/backup-state/types';
import AppToggle from '@common/components/buttons/AppToggle.vue';
import AppBtnIcon from '@common/components/buttons/AppBtnIcon.vue';
import AppModal from '@common/components/modal/AppModal.vue';
import SettingsRow from '@action/modules/settings/components/settings-row.vue';
import BackupIdenticon from '@action/modules/settings/components/backup-identicon.vue';

const backupState = new BackupState();
const loading = ref(true);
const isBackupsEnabled = ref(true);
const currentUserId = ref('');
const backups = ref<ListBackupType[]>([]);

const isDeleteOpen = ref(false);
const isDeleting = ref(false);
const selectedBackup = ref<ListBackupType | null>(null);

const listHeading = computed(() => {
  if (loading.value) return 'Fetching backups';
  return backups.value.length ? 'Current backups' : 'No backups found';
});

onMounted(async () => {
  isBackupsEnabled.value = await backupState.isBackupEnabled();
  currentUserId.value = await backupState.getUserId();
  backups.value = await backupState.listBackups();
  loading.value = false;
});

const toggleBackups = async (checked: boolean) => {
  isBackupsEnabled.value = checked;
  loading.value = true;
  if (checked) {
    await backupState.enableBackups();
    await backupState.backup(false);
    backups.value = await backupState.listBackups();
  } else {
    await backupState.disableBackups();
  }
  loading.value = false;
};

const showDeleteBackup = (backup: ListBackupType) => {
  selectedBackup.value = backup;
  isDeleteOpen.value = true;
};

const deleteBackup = async () => {
  if (!selectedBackup.value) return;
  isDeleting.value = true;
  try {
    await backupState.deleteBackup(selectedBackup.value.userId);
    backups.value = await backupState.listBackups();
    isDeleteOpen.value = false;
  } finally {
    isDeleting.value = false;
  }
};

const backupName = (backup: ListBackupType) =>
  generateRandomNameWithSeed(' ', backup.userId);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
</script>
