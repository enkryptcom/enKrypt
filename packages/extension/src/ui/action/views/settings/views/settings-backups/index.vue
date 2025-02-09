<template>
  <div>
    <settings-inner-header v-bind="$attrs" :is-backups="true" />
    <settings-switch
      title="Enable backups"
      :is-checked="isBackupsEnabled"
      @update:check="toggleBackups"
    />
    <div class="settings__label">
      <p>
        Backups are currently {{ isBackupsEnabled ? 'enabled' : 'disabled' }}.
      </p>
    </div>
    <p>Current Backups</p>
    <table>
      <thead>
        <tr>
          <th
            v-for="(header, i) in headers"
            :key="`${header}${i}`"
            class="header-item"
          >
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entity in backups"
          :key="`entity-${entity.userId}`"
          class="table-rows"
        >
          <td>{{ entity.userId }}</td>
          <td>{{ entity.updatedAt }}</td>
          <td>
            {{ currentUserId === entity.userId ? 'true' : 'false' }}
          </td>
          <td>
            <settings-button
              style="max-width: 100px"
              title="delete"
              @click="deleteBackup(entity.userId)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import BackupState from '@/libs/backup-state';
import { BackupType } from '@/libs/backup-state/types';
import SettingsInnerHeader from '@action/views/settings/components/settings-inner-header.vue';
import SettingsSwitch from '@action/views/settings/components/settings-switch.vue';
import SettingsButton from '@action/views/settings/components/settings-button.vue';
import { onMounted, ref } from 'vue';

const backupState = new BackupState();
const isBackupsEnabled = ref(true);
const currentUserId = ref('');
const backups = ref<BackupType[]>([]);
const headers = ['userid', 'last updated', 'this', 'delete'];

onMounted(async () => {
  isBackupsEnabled.value = await backupState.isBackupEnabled();
  currentUserId.value = await backupState.getUserId();
  backups.value = await backupState.getBackups();
});

const toggleBackups = async (checked: boolean) => {
  isBackupsEnabled.value = checked;
  if (isBackupsEnabled.value) {
    await backupState.enableBackups();
    await backupState.backup(false);
    backups.value = await backupState.getBackups();
  } else {
    await backupState.disableBackups();
  }
};

const deleteBackup = async (userId: string) => {
  await backupState.deleteBackup(userId);
  backups.value = await backupState.getBackups();
};
</script>

<style lang="less">
@import '@action/styles/theme.less';
.settings {
  &__label {
    padding: 0 48px;
    margin-bottom: 10px;
    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @tertiaryLabel;
      margin: 0;
    }
  }

  &__wrap {
    .base-select__container {
      margin-bottom: 12px;
    }
  }
}
</style>
