<template>
  <div class="send-alert">
    <alert-icon />
    <p>{{ errorMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import AlertIcon from '@action/icons/send/alert-icon.vue';

interface IProps {
  errorMsg: string;
}

defineProps<IProps>();
</script>

<style lang="less">
@import '@action/styles/theme.less';

.send-alert {
  margin: 0 32px 8px 32px;
  background: @error01;
  border-radius: 10px;
  padding: 12px 16px 12px 57px;
  position: relative;
  box-sizing: border-box;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    margin-top: -12px;
  }

  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @error;
    margin: 0;

    a {
      color: @error;

      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
