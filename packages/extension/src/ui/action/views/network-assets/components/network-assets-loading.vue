<template>
  <div class="network-assets__loading">
    <p>Loading...</p>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworAssetsLoading",
};
</script>

<script setup lang="ts"></script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-assets {
  &__loading {
    width: 100%;
    height: 384px;
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
