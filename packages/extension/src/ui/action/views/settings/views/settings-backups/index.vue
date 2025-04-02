<template>
  <div class="settings-container">
    <settings-inner-header v-bind="$attrs" :is-backups="true" />
    <div v-if="!isDelete">
      <div class="settings-container__label">
        <p>
          Save your current list of accounts across all networks, so you don't
          need to re-generate them when you import or restore your wallet with
          Enkrypt. You will still need your recovery phrase. We only back up
          non-vital information such as account names and derivation paths. Your
          sensitive information, like your mnemonic and private keys, is never
          backed up.
        </p>
      </div>
      <settings-switch
        :title="`Backup ${isBackupsEnabled ? 'on' : 'off'}`"
        :is-checked="isBackupsEnabled"
        @update:check="toggleBackups"
      />

      <div>
        <div v-if="loading" class="settings-container__backup">
          <div class="settings-container__backup-header">Fetching backups</div>
          <div
            v-for="(item, index) in [1, 2, 3]"
            :key="`entity-${item}-${index}`"
            class="settings-container__backup-item"
          >
            <div class="settings-container__backup-item__loading-container">
              <balance-loader />
              <balance-loader />
            </div>
            <div class="settings-container__backup-status__loading">
              <balance-loader />
            </div>
          </div>
        </div>
        <div
          v-else-if="backups.length === 0"
          class="settings-container__backup"
        >
          <div class="settings-container__backup-header">No backups found</div>
        </div>
        <div class="settings-container__backup" v-else>
          <div class="settings-container__backup-header">Current backups</div>
          <div class="settings-container__backup-container">
            <div
              v-for="(entity, index) in backups"
              :key="`entity-${entity.userId}-${index}`"
              class="settings-container__backup-item"
            >
              <div class="settings-container__backup-item__content">
                <backup-identicon :hash="entity.userId" />
                <div class="settings-container__backup-item__name">
                  <h4>{{ generateRandomNameWithSeed(' ', entity.userId) }}</h4>
                  <p>Last backup on: {{ formatDate(entity.updatedAt) }}</p>
                </div>
              </div>
              <div class="settings-container__backup-status">
                <div v-if="entity.userId === currentUserId">
                  <span
                    :class="[
                      'settings-container__backup-status-badge',
                      'settings-container__backup-status-active',
                    ]"
                  >
                    Active
                  </span>
                </div>
                <div>
                  <div
                    class="settings-container__backup-status-button"
                    @click="showDeleteBackup(entity)"
                  >
                    <delete-icon />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-container__backup" v-else>
      <div class="settings-container__backup-header">
        Are you sure you want to delete:
      </div>
      <div class="settings-container__backup-item">
        <div class="settings-container__backup-item__content">
          <backup-identicon :hash="selectedBackup!.userId" />
          <div class="settings-container__backup-item__name">
            <h4>
              {{ generateRandomNameWithSeed(' ', selectedBackup!.userId) }}
            </h4>
            <p>Last backup on: {{ formatDate(selectedBackup!.updatedAt) }}</p>
          </div>
        </div>
      </div>
      <div class="settings-container__backup-delete-buttons">
        <base-button
          title="Delete"
          @click="deleteBackup(selectedBackup!.userId)"
          red
        />
        <base-button title="Cancel" @click="isDelete = false" no-background />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import BackupState from '@/libs/backup-state';
import { ListBackupType } from '@/libs/backup-state/types';
import SettingsInnerHeader from '@action/views/settings/components/settings-inner-header.vue';
import SettingsSwitch from '@action/views/settings/components/settings-switch.vue';
import deleteIcon from '@/ui/action/icons/actions/trash.vue';
import BalanceLoader from '@action/icons/common/balance-loader.vue';
import BackupIdenticon from './backup-identicon.vue';
import BaseButton from '@action/components/base-button/index.vue';
import { generateRandomNameWithSeed } from '@enkryptcom/utils';

const backupState = new BackupState();
const loading = ref(true);
const isBackupsEnabled = ref(true);
const currentUserId = ref('');
const backups = ref<ListBackupType[]>([]);
const isDelete = ref(false);
const selectedBackup = ref<ListBackupType | null>();

onMounted(async () => {
  isBackupsEnabled.value = await backupState.isBackupEnabled();
  currentUserId.value = await backupState.getUserId();
  backups.value = await backupState.listBackups();
  loading.value = false;
});

const toggleBackups = async (checked: boolean) => {
  isBackupsEnabled.value = checked;
  loading.value = true;
  if (isBackupsEnabled.value) {
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
  isDelete.value = true;
};

const deleteBackup = async (userId: string) => {
  loading.value = true;
  await backupState.deleteBackup(userId);
  backups.value = await backupState.listBackups();
  loading.value = false;
  isDelete.value = false;
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.settings-container {
  padding: 16px;

  &__backup {
    margin: 0 32px;

    &-delete-buttons {
      margin: 65px 50px;

      a {
        margin-top: 10px;
      }
    }

    &-container {
      height: 205px; // adding a small cutoff to let user know there's more
      overflow-y: auto;
      padding-right: 10px;
    }

    &-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;

      &__content {
        display: flex;
        align-items: center;
      }

      &__name {
        margin-left: 10px;
      }

      h4 {
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
        color: #202124;
        margin: 0 0 1px 0;
      }

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.5px;
        color: #5f6368;
        margin: 0;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;
      }

      &__loading-container {
        display: flex;
        flex-direction: column;

        svg {
          &:first-child {
            width: 150px;
            margin-bottom: 5px;
          }

          &:last-child {
            width: 100px;
          }
        }
      }
    }

    &-status {
      display: flex;
      align-items: center;

      &__loading {
        svg {
          width: 100px;
        }
      }

      &-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
      }

      &-active {
        color: @primary;
      }

      &-inactive {
        color: @secondaryLabel;
      }

      &-button {
        margin-left: 10px;
        cursor: pointer;
        font-size: 0;
        transition: background 300ms ease-in-out;
        width: 16px;
        height: 16px;
        padding: 5px 8px 5px 8px;
        background: transparent;
        border-radius: 24px;
        transition: @opacity-noBG-transition;
        cursor: pointer;
        &:hover {
          background: @black007;
        }
      }
    }
  }

  &__label {
    padding: 0 32px;
    margin-bottom: 27px;

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      color: @tertiaryLabel;
      margin: 0;
    }
  }

  &__backup-header {
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    margin: 30px 0 15px;
  }
}
</style>
