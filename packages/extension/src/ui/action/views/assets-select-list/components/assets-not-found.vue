<template>
  <div class="assets-not-found">
    <Vue3Lottie
      :animation-data="LottieSearchNotFound"
      :loop="false"
      class="assets-not-found__animation"
    />
    <div class="assets-not-found__header">No results found</div>
  </div>
</template>
<script lang="ts">
export default {
  name: "AssetsNotFound",
};
</script>
<script setup lang="ts">
import { Vue3Lottie } from "vue3-lottie";
import LottieSearchNotFound from "@action/assets/animation/search-not-found.json";
</script>
<style lang="less">
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";
.assets-not-found {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 64px;

  &__animation {
    width: 256px;
  }

  &__header {
    color: @primaryLabel;
    font-weight: 600;
    font-size: 24px;
  }
}
</style>
