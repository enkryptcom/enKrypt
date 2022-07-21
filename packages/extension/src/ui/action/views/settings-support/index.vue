<template>
  <div>
    <settings-inner-header
      :back="back"
      :close="close"
      :is-support="true"
    ></settings-inner-header>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import SettingsInnerHeader from "@action/views/settings/components/settings-inner-header.vue";

defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  back: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";
</style>
