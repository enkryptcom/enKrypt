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
    height: calc(100% - 150px);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    box-sizing: border-box;
    position: absolute;
    top: 150px;

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 0.6;
      letter-spacing: 0.25px;
      color: @tertiaryLabel;
      margin: 0;
    }
  }
}
</style>
