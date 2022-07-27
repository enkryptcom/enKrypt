<template>
  <div class="status-timer">
    <span>{{ $filters.formatDuration(timer, date) }}</span>
    <send-spinner-animation class="status-timer__spiner" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import moment from "moment";

import SendSpinnerAnimation from "@action/icons/send/send-spinner-animation.vue";

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

<style lang="less">
@import "~@action/styles/theme.less";

.status-timer {
  display: inline-block;
  font-size: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;

  &__spiner {
    width: 16px;
    height: 16px;
    margin-left: 2px;
  }

  span {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @success;
  }
}
</style>
