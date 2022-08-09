<template>
  <div class="network-nfts__empty">
    <p v-if="!isEmpty">
      <loader />
    </p>
    <p v-if="isEmpty">Your NFTs will be shown here.</p>
  </div>
</template>
<script setup lang="ts">
import Loader from "@action/icons/common/loader.vue";
defineProps({
  isEmpty: Boolean,
});
</script>
<style lang="less">
@import "~@action/styles/theme.less";

.network-nfts {
  &__empty {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding-bottom: 56px;
    box-sizing: border-box;

    svg {
      margin-bottom: 8px;
    }

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
