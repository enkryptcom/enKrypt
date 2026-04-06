<template>
  <div class="network-activity__loading">
    <p v-if="!isEmpty">
      <loader />
    </p>
    <p v-if="isEmpty">Account transactions will be<br />displayed here</p>
  </div>
</template>
<script setup lang="ts">
import Loader from '@action/icons/common/loader.vue';
defineProps({
  isEmpty: Boolean,
});
</script>
<style lang="less" scoped>
@import '@action/styles/theme.less';

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.network-activity {
  &__loading {
    width: 100%;
    height: calc(~'100% - 216px');
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding-bottom: 56px;
    box-sizing: border-box;
    animation: fadeIn 0.4s ease-out;

    svg {
      margin-bottom: 12px;
      opacity: 0.7;
    }

    p {
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 22px;
      letter-spacing: 0.2px;
      color: @tertiaryLabel;
      margin: 0;
      text-align: center;
      padding: 16px 32px;
      background: rgba(0, 0, 0, 0.02);
      border-radius: 12px;
      border: 1px dashed rgba(0, 0, 0, 0.08);
    }
  }
}
</style>
