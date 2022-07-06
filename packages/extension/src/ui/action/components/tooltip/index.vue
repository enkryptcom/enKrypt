<template>
  <div class="tooltip" @mouseenter="onHover" @mouseleave="onHide">
    <slot></slot>

    <div v-show="show" class="tooltip__wrap" :class="classObject()">
      {{ text }}
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "Tooltip",
};
</script>

<script setup lang="ts">
import { ref } from "vue";

const show = ref(false);
const positionX = ref(0);
const positionY = ref(0);
const visible = ref(false);

defineProps({
  text: {
    type: String,
    default: "",
  },
});

const onHover = (e: any) => {
  const { pageX, pageY } = e;

  if (!show.value) {
    show.value = true;
    positionX.value = pageX;
    positionY.value = pageY;

    setTimeout(() => {
      visible.value = true;
    }, 50);
  }
};

const onHide = () => {
  if (visible.value) {
    visible.value = false;

    setTimeout(() => {
      show.value = false;
      positionX.value = 0;
      positionY.value = 0;
    }, 300);
  }
};

const classObject = () => {
  const x = positionX.value;
  const y = positionY.value;

  switch (true) {
    case x > 740 && y < 50:
      return { "right-bottom": true, visible: visible.value };
    case x < 741 && y < 50:
      return { bottom: true, visible: visible.value };
    default:
      return { normal: true, visible: visible.value };
  }
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.tooltip {
  display: inline-block;
  position: relative;
  font-size: 0;

  &__wrap {
    padding: 8px 12px;
    position: absolute;
    background: @secondaryLabel;
    border-radius: 8px;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @white;
    white-space: nowrap;
    box-sizing: border-box;
    z-index: 131;
    transition: opacity 300ms ease-in-out;
    opacity: 0;

    &.visible {
      opacity: 1;
    }

    &.normal {
      top: -100%;
      left: 50%;
      transform: translateX(-50%) translateY(0px);
    }

    &.right-bottom {
      top: calc(~"100% + 4px");
      right: 0;
      transform: translateX(0) translateY(0px);
    }

    &.bottom {
      top: calc(~"100% + 4px");
      left: 50%;
      transform: translateX(-50%) translateY(0px);
    }
  }
}
</style>
