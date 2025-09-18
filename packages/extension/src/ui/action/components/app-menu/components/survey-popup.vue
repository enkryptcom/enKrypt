<template>
  <div class="survey-popup">
    <div class="survey-popup__content">
      <h5>Help us improve Enkrypt</h5>
      <p>Please take a quick survey. We appreciate you!</p>
      <a href="javascript:void(0);" @click="openSurveyLink" class="button"
        ><span>Click here</span></a
      >
    </div>

    <a class="survey-popup__close" @click="close">
      <close-icon />
    </a>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@action/icons/common/close-icon.vue';
import { openLink } from '@action/utils/browser';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const close = () => {
  emit('close');
};
const openSurveyLink = async () => {
  openLink('https://tally.so/r/nGMpdL');
  close();
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.survey-popup {
  position: absolute;
  width: 324px;
  left: 8px;
  bottom: 8px;
  background: #ffffff;
  box-shadow:
    0px 8px 16px -6px rgba(0, 0, 0, 0.12),
    0px 6px 8px -6px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  overflow: hidden;
  z-index: 2;

  &__content {
    display: flex;
    align-items: center;
    flex-direction: column;
    h5 {
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: 20px;
      text-align: center;
      /* 125% */
      letter-spacing: 0.15px;
      color: @primaryLabel;
      margin: 0;
      background: linear-gradient(to left, #14f195, #64abf2, #9945ff);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      text-align: center;
    }

    .button {
      text-decoration: none;
      width: auto;
      width: 163px;
      height: 32px;
      font-size: 12px;
      line-height: 32px;
      margin-left: auto;
      margin-right: auto;
    }
  }

  &__close {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    transition: opacity 300ms ease-in-out;
    opacity: 1;
    font-size: 0;
    width: 32px;
    height: 32px;

    svg {
      width: 32px;
      height: 32px;
    }

    &:hover {
      opacity: 0.7;
    }
  }
}
</style>
