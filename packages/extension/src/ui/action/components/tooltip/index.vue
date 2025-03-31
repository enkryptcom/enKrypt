<template>
  <div class="tooltip" @mouseenter="onHover" @mouseleave="onHide">
    <slot />
    <teleport to="#app" :disabled="!teleportToApp">
      <div
        ref="tooltipRef"
        v-show="show"
        class="tooltip__wrap"
        :class="classObject()"
      >
        {{ text }}
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const show = ref(false);
const positionX = ref(0);
const positionY = ref(0);
const visible = ref(false);

let timeout: ReturnType<typeof setTimeout> | null = null;

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  isTopRight: {
    type: Boolean,
    default: false,
  },
  isTopLeft: {
    type: Boolean,
    default: false,
  },
  isBottomRight: {
    type: Boolean,
    default: false,
  },
  isBottomLeft: {
    type: Boolean,
    default: false,
  },
  teleportToApp: {
    type: Boolean,
    default: false,
  },
});

const tooltipRef = ref<HTMLElement | null>(null);
const onHover = (e: any) => {
  if (timeout != null) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(() => {
    const { pageX, pageY } = e;
    if (!show.value) {
      show.value = true;
      if (props.teleportToApp) {
        if (tooltipRef.value) {
          const topPosition = e.target.getBoundingClientRect().top + 2;
          const bottom = e.target.getBoundingClientRect().bottom - 1;
          if (props.isTopRight) {
            const rightTopPosition =
              e.target.getBoundingClientRect().width +
              e.target.getBoundingClientRect().x -
              10;
            tooltipRef.value.style.top = `${topPosition}px`;
            tooltipRef.value.style.left = `${rightTopPosition}px`;
            tooltipRef.value.style.transform =
              'translateX(0) translateY(-100%)';
          } else if (props.isBottomRight) {
            const rightBottomPosition =
              e.target.getBoundingClientRect().width +
              e.target.getBoundingClientRect().x -
              4;
            tooltipRef.value.style.top = `${bottom}px`;
            tooltipRef.value.style.left = `${rightBottomPosition}px`;
          } else if (props.isTopLeft) {
            const left =
              e.target.getBoundingClientRect().x -
              e.target.getBoundingClientRect().width +
              10;
            tooltipRef.value.style.left = `${left}px`;
            tooltipRef.value.style.top = `${topPosition}px`;
            tooltipRef.value.style.transform =
              'translateX(0) translateY(-100%)';
          } else if (props.isBottomLeft) {
            const left =
              e.target.getBoundingClientRect().x -
              e.target.getBoundingClientRect().width +
              10;
            tooltipRef.value.style.left = `${left}px`;
            tooltipRef.value.style.top = `${bottom}px`;
          } else {
            const tooltipMiddle =
              tooltipRef.value.getBoundingClientRect().width / 2;
            const middle =
              e.target.getBoundingClientRect().left +
              e.target.getBoundingClientRect().width / 2 -
              tooltipMiddle;
            tooltipRef.value.style.top = `${bottom}px`;
            tooltipRef.value.style.left = `${middle}px`;
          }
        }
      }
      positionX.value = pageX;
      positionY.value = pageY;

      setTimeout(() => {
        visible.value = true;
      }, 50);
    }
  }, 400);
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
  if (props.teleportToApp) {
    return { visible: visible.value };
  }
  if (props.isTopRight) {
    return { 'right-top': true, visible: visible.value };
  }
  if (props.isTopLeft) {
    return { 'left-top': true, visible: visible.value };
  }
  if (props.isBottomRight) {
    return { 'right-bottom': true, visible: visible.value };
  }
  const x = positionX.value;
  const y = positionY.value;
  switch (true) {
    case x > 740 && y < 50:
      return { 'right-bottom': true, visible: visible.value };
    case x < 741 && y < 50:
      return { bottom: true, visible: visible.value };
    default:
      return { normal: true, visible: visible.value };
  }
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.tooltip {
  display: inline-block;
  position: relative;
  font-size: 0;

  &__wrap {
    padding: 4px 8px;
    position: absolute;
    background: @buttonBg;
    border: 0.5px solid rgba(0, 0, 0, 0.16);
    box-shadow:
      0px 1px 3px -2px rgba(0, 0, 0, 0.1),
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
      top: calc(~'-100% + 8px');
      left: 50%;
      transform: translateX(-50%) translateY(0px);
    }

    &.right-bottom {
      top: calc(~'100% + 3px');
      right: 0;
      transform: translateX(0) translateY(0px);
    }
    &.left-bottom {
      top: calc(~'100% + 3px');
      left: 0;
      transform: translateX(0) translateY(0px);
    }
    &.right-top {
      top: calc(~'-100% + 2px');
      right: 0;
      transform: translateX(0) translateY(0px);
    }
    &.left-top {
      top: calc(~'-100% + 2px');
      left: 0;
      transform: translateX(0) translateY(0px);
    }

    &.bottom {
      top: calc(~'100% + 3px');
      left: 50%;
      transform: translateX(-50%) translateY(0px);
    }
  }
}
</style>
