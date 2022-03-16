<template>
  <div class="status-timer">
    <span>{{ $filters.formatDuration(timer, date) }}</span>
    <Vue3Lottie :animation-data="LottieStatusJson" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import moment from "moment";
import LottieStatusJson from "../../../assets/animation/status.json";
export default defineComponent({
  name: "StatusTimer",
  props: {
    date: {
      type: Number,
      default: 0,
    },
  },
  data(props) {
    let timer = moment(props.date).diff(Date.now());

    return {
      LottieStatusJson,
      timer: moment.duration(timer),
    };
  },
  mounted() {
    this.updateTimer();
  },
  methods: {
    updateTimer: function () {
      setInterval(() => {
        this.timer = moment.duration(moment(this.$props.date).diff(Date.now()));
      }, 1000);
    },
  },
});
</script>

<style lang="less">
@import "../../../styles/theme.less";

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
