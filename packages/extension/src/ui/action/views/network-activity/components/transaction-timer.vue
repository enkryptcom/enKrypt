<template>
  <div class="status-timer">
    <span>{{ $filters.formatDuration(timer, date) }}</span>
    <Vue3Lottie
      class="status-timer__spiner"
      :animation-data="LottieStatusJson"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "TransactionTimer",
};
</script>

<script setup lang="ts">
import { defineProps, onMounted } from "vue";
import moment from "moment";
import LottieStatusJson from "@action/assets/animation/status.json";

const props = defineProps({
  date: {
    type: Number,
    default: 0,
  },
});

let timer = moment.duration(moment(props.date).diff(Date.now()));

onMounted(() => {
  updateTimer();
});

const updateTimer = () => {
  setInterval(() => {
    timer = moment.duration(moment(props.date).diff(Date.now()));
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
    color: @primary;
  }
}
</style>
