<template>
  <div class="provider-verify-transaction__error">
    <alert-icon />
    <p>
      Warning: you may be allowing this site to perform a transaction that has
      an unexpected outcome. Only approve transactions from trusted sites.
    </p>
    <p>
      For more information on the transaction you are performing, click Show
      data below.
    </p>
  </div>
</template>

<script setup lang="ts">
import AlertIcon from "@action/icons/send/alert-icon.vue";

// const props = defineProps<null>();
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "../styles/verify-transaction.less";
</style>
