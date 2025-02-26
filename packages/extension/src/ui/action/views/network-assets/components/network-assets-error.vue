<template>
  <div class="network-assets__error">
    <h3>Loading assets failed. Please try again later.</h3>

    <base-button
      class="network-assetss__error-button"
      title="Try again"
      :click="updateAssets"
    />
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@action/components/base-button/index.vue';

defineProps({
  updateAssets: Function,
});
</script>

<style lang="less">
@import '@action/styles/theme.less';

.network-assets {
  &__error {
    width: 100%;
    height: calc(100% - 150px);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    box-sizing: border-box;
    position: absolute;
    top: 150px;

    h3 {
      color: @error;
    }

    a {
      width: 150px;
    }
  }
}
</style>
