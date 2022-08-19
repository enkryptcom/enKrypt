<template>
  <div class="unlock-keyring">
    <common-popup />
  </div>
</template>

<script setup lang="ts">
import CommonPopup from "@action/views/common-popup/index.vue";
</script>

<style lang="less">
@import "~@/providers/ethereum/ui/styles/common-popup.less";
@import "~@action/styles/theme.less";
</style>
