<template>
  <div class="backup-detected">
    <h3>Found backup</h3>

    <div class="backup-detected__backups">
      <h4>Please choose a backup to use:</h4>
      <div class="backup-detected__backup-items-container">
        <a
          v-for="backup in backups"
          :key="backup"
          @click="selectBackup(backup)"
          :class="[
            { selected: selectedBackup === backup },
            'backup-detected__backup-item',
          ]"
        >
          {{ backup }}
        </a>
      </div>
    </div>
    <base-button title="Use backup" :disabled="disabled" :click="useBackup" />
    <base-button
      style="margin-top: 10px"
      no-background
      title="Skip"
      :click="skip"
    />
  </div>
</template>
<script setup lang="ts">
import BaseButton from '@action/components/base-button/index.vue';
import { computed, ref } from 'vue';

const selectedBackup = ref('');
const disabled = computed(() => !selectedBackup.value);
const backups = ['Backup 1', 'Backup 2', 'Backup 3'];

const selectBackup = (backup: string) => {
  if (selectedBackup.value === backup) {
    selectedBackup.value = '';
  } else {
    selectedBackup.value = backup;
  }
};
const useBackup = () => {
  // replace with actual functionality
  window.close();
};

const skip = () => {
  window.close();
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
