<template>
  <div class="tooltip" @mouseenter="onHover" @mouseleave="onHide">
    <slot />

    <div v-show="show" class="tooltip__wrap" :class="classObject()">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const show = ref(false);
const positionX = ref(0);
const positionY = ref(0);
const visible = ref(false);

let timeout: ReturnType<typeof setTimeout> | null = null;

defineProps({
  text: {
    type: String,
    default: "",
  },
});

const onHover = (e: any) => {
  if (timeout != null) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(() => {
    const { pageX, pageY } = e;

    if (!show.value) {
      show.value = true;
      positionX.value = pageX;
      positionY.value = pageY;

      setTimeout(() => {
        visible.value = true;
      }, 50);
    }
  }, 700);
};

const onHide = () => {
  if (timeout != null) {
    clearTimeout(timeout);

    timeout = null;
  }
  if (visible.value) {
    visible.value = false;

    setTimeout(() => {
      show.value = false;
      positionX.value = 0;
      positionY.value = 0;
    }, 300);
  } else {
    visible.value = false;
    show.value = false;
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
    padding: 4px 8px;
    position: absolute;
    background: @buttonBg;
    border: 0.5px solid rgba(0, 0, 0, 0.16);
    box-shadow: 0px 1px 3px -2px rgba(0, 0, 0, 0.1),
      0px 2px 5px rgba(0, 0, 0, 0.12);
    border-radius: 6px;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.25px;
    color: @secondaryLabel;
    white-space: nowrap;
    box-sizing: border-box;
    z-index: 131;
    transition: opacity 300ms ease-in-out;
    opacity: 0;

    &.visible {
      opacity: 1;
    }

    &.normal {
      top: calc(~"-100% + 8px");
      left: 50%;
      transform: translateX(-50%) translateY(0px);
    }

    &.right-bottom {
      top: calc(~"100% + 3px");
      right: 0;
      transform: translateX(0) translateY(0px);
    }

    &.bottom {
      top: calc(~"100% + 3px");
      left: 50%;
      transform: translateX(-50%) translateY(0px);
    }
  }
}
</style>
