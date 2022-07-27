<template>
  <div class="network-assets__loading">
    <p><loader /></p>
  </div>
</template>

<script setup lang="ts">
import Loader from "@action/icons/common/loader.vue";
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-assets {
  &__loading {
    width: 100%;
    height: calc(~"100% - 216px");
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding-bottom: 56px;
    box-sizing: border-box;

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @tertiaryLabel;
      margin: 0;
    }
  }
}
</style>
