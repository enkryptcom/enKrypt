<template>
  <div class="settings-container">
    <settings-inner-header v-bind="$attrs" :is-backups="true" />

    <settings-switch
      :title="`Settings backup ${isBackupsEnabled ? 'on' : 'off'}`"
      :is-checked="isBackupsEnabled"
      @update:check="toggleBackups"
    />

    <div class="settings__label">
      <p>Vince provide copy</p>
    </div>

    <div v-if="isBackupsEnabled" class="settings__backup">
      <div v-if="loading">
        <div class="settings__backup-header">Loading backups</div>
        <table class="settings__backup-table">
          <thead>
            <tr>
              <th v-for="(header, i) in headers" :key="`header-${i}`">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <balance-loader class="settings__backup-table__loader-one" />
              </td>
              <td>
                <balance-loader class="settings__backup-table__loader-one" />
              </td>
              <td>
                <balance-loader class="settings__backup-table__loader-two" />
              </td>
              <td>
                <balance-loader class="settings__backup-table__loader-two" />
              </td>
            </tr>
            <tr>
              <td>
                <balance-loader class="settings__backup-table__loader-one" />
              </td>
              <td>
                <balance-loader class="settings__backup-table__loader-one" />
              </td>
              <td>
                <balance-loader class="settings__backup-table__loader-two" />
              </td>
              <td>
                <balance-loader class="settings__backup-table__loader-two" />
              </td>
            </tr>
            <tr>
              <td>
                <balance-loader class="settings__backup-table__loader-one" />
              </td>
              <td>
                <balance-loader class="settings__backup-table__loader-one" />
              </td>
              <td>
                <balance-loader class="settings__backup-table__loader-two" />
              </td>
              <td>
                <balance-loader class="settings__backup-table__loader-two" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="backups.length === 0">
        <div class="settings__backup-header">No backups found</div>
      </div>

      <div v-else>
        <div class="settings__backup-header">Current backups</div>

        <table class="settings__backup-table">
          <thead>
            <tr>
              <th v-for="(header, i) in headers" :key="`header-${i}`">
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entity, index) in backups"
              :key="`entity-${entity.userId}-${index}`"
            >
              <td>{{ concatId(entity.userId) }}</td>
              <td>{{ formatDate(entity.updatedAt) }}</td>
              <td>
                <span
                  :class="[
                    'settings__backup-table__status-badge',
                    'settings__backup-table__status-active',
                  ]"
                  v-if="entity.userId === currentUserId"
                >
                  Active
                </span>
              </td>
              <td>
                <div
                  class="settings__backup-table__action-button"
                  @click="deleteBackup(entity.userId)"
                >
                  <delete-icon />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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

const backupState = new BackupState();
const loading = ref(true);
const isBackupsEnabled = ref(true);
const currentUserId = ref('');
const backups = ref<ListBackupType[]>([]);
const headers = ['User ID', 'Generated', 'Status', 'Delete'];

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

const concatId = (userId: string) => {
  return `${userId.slice(0, 4)}...${userId.slice(-4)}`;
};

const deleteBackup = async (userId: string) => {
  loading.value = true;
  await backupState.deleteBackup(userId);
  backups.value = await backupState.listBackups();
  loading.value = false;
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
}

.settings__backup {
  margin: 0 32px 12px 32px;
}

.settings__label {
  padding: 0 48px;
  margin-bottom: 10px;

  p {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    color: @tertiaryLabel;
  }
}

.settings__backup-header {
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  margin: 30px 0 15px;
}

.settings__backup-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 12px;
  overflow: hidden;
  background: @primaryBg;

  &__loader-one {
    width: 100px;
  }

  &__loader-two {
    width: 65px;
  }

  thead {
    color: rgba(0, 0, 0, 0.6);
    font-size: 10px;
    font-weight: 500;
    line-height: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin: 0;

    th {
      padding: 10px;
      text-align: left;
      font-weight: bold;
      text-align: center;
      height: 30px;

      &:first-child {
        width: 150px;
      }
    }
  }

  tbody {
    td {
      padding: 10px;
      text-align: center;

      &:nth-child(1) {
        text-align: left;
      }
    }
  }

  &__status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
  }

  &__status-active {
    background: @primaryLight;
    color: @primary;
  }

  &__action-button {
    cursor: pointer;
  }
}
</style>
