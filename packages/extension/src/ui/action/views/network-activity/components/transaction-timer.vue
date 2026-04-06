<template>
  <div class="status-timer">
    <span>{{ $filters.formatDuration(timer, date) }}</span>
    <send-spinner-animation class="status-timer__spiner" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import moment from 'moment';

import SendSpinnerAnimation from '@action/icons/send/send-spinner-animation.vue';

const props = defineProps({
  date: {
    type: Number,
    default: 0,
  },
});

const timer = ref(moment.duration(moment(props.date).diff(Date.now())));

onMounted(() => {
  updateTimer();
});

const updateTimer = () => {
  setInterval(() => {
    timer.value = moment.duration(moment(props.date).diff(Date.now()));
  }, 1000);
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.status-timer {
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  gap: 4px;
  padding: 2px 8px 2px 6px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 10px;

  &__spiner {
    width: 14px;
    height: 14px;
  }

  span {
    font-style: normal;
    font-weight: 600;
    font-size: 11px;
    line-height: 14px;
    letter-spacing: 0.3px;
    color: #16a34a;
  }
}
</style>
