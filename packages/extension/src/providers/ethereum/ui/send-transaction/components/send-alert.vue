<template>
  <div class="send-alert" role="alert" aria-live="polite">
    <alert-icon />
    <p aria-label="Error message">{{ errorMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import AlertIcon from '@action/icons/send/alert-icon.vue';

interface IProps {
  errorMsg: string;
}

defineProps<IProps>();
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-alert {
  margin: 4px 24px 8px 24px;
  border: 1.5px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 12px 16px 12px 48px;
  position: relative;
  box-sizing: border-box;
  animation: alertSlideIn 200ms ease-out;

  @keyframes alertSlideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    margin-top: -12px;
    color: @error;
  }

  p {
    font-weight: 500;
    font-size: 13px;
    line-height: 18px;
    letter-spacing: 0.15px;
    color: @error;
    margin: 0;

    a {
      color: @error;
      font-weight: 600;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 2px;

      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
