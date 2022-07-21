<template>
  <div class="notification">
    <div class="notification__wrap" :class="{ visible: visible }">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";

const visible = ref(true);

const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  hide: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
});

setTimeout(() => {
  visible.value = false;
}, 1000);

setTimeout(() => {
  props.hide();
}, 1300);
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.notification {
  display: inline-block;
  position: relative;
  font-size: 0;

  &__wrap {
    padding: 8px 12px;
    background: @secondaryLabel;
    border-radius: 8px;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @secondaryLabel;
    white-space: nowrap;
    box-sizing: border-box;
    z-index: 141;
    transition: opacity 300ms ease-in-out;
    opacity: 0;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @white;

    &.visible {
      opacity: 1;
    }
  }
}
</style>
