<template>
  <div class="network-activity__loading">
    <p v-if="isLoading">
      <loader />
    </p>
    <p v-if="isEmpty && !isLoading">No results found</p>
  </div>
</template>
<script setup lang="ts">
import Loader from "@action/icons/common/loader.vue";
defineProps({
  isEmpty: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  isLoading: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});
</script>
<style lang="less">
@import "~@action/styles/theme.less";

.network-activity {
  &__loading {
    width: 100%;
    height: 455px;
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
      text-align: center;
    }
  }
}
</style>
