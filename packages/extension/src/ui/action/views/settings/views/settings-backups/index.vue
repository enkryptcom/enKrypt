<template>
  <div>
    <settings-inner-header v-bind="$attrs" :is-backups="true" />

    <settings-button title="Enable backups" :is-link="true" />
  </div>
</template>

<script setup lang="ts">
import SettingsInnerHeader from '@action/views/settings/components/settings-inner-header.vue';
import SettingsButton from '@action/views/settings/components/settings-button.vue';
</script>

<style lang="less">
@import '@action/styles/theme.less';
</style>
