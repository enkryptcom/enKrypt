<template>
  <div>
    <settings-inner-header :is-support="true" v-bind="$attrs" />
  </div>
</template>

<script setup lang="ts">
import SettingsInnerHeader from "@action/views/settings/components/settings-inner-header.vue";
</script>

<style lang="less">
@import "~@action/styles/theme.less";
</style>
