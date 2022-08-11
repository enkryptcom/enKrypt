<template>
  <div class="lock-screen-timer">
    <logo-big class="lock-screen-timer__logo" />
    <p>You need to wait until entering password again</p>
    <h4>
      {{ timer == 60 ? "1:00" : "0:" + (timer > 9 ? timer : "0" + timer) }}
    </h4>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import LogoBig from "@action/icons/common/logo-big.vue";
const timer = ref(60);
onMounted(() => {
  updateTimer();
});
const props = defineProps({
  close: {
    type: Function,
    default: () => {
      return null;
    },
  },
});
const updateTimer = () => {
  const interval = setInterval(() => {
    if (timer.value == 0) {
      clearInterval(interval);
      props.close();
    } else {
      timer.value = timer.value - 1;
    }
  }, 1000);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
.lock-screen-timer {
  width: 320px;
  height: auto;
  box-sizing: border-box;
  position: relative;
  &__logo {
    margin-bottom: 16px;
  }
  p {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @secondaryLabel;
    margin: 0 0 16px 0;
  }
  h4 {
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 32px;
    color: @primaryLabel;
    margin: 0;
  }
}
</style>
