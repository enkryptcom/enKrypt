<template>
  <div class="common-popup">
    <custom-scrollbar
      ref="commonPopupScrollRef"
      class="common-popup__scroll-area"
    >
      <div class="common-popup__header">
        <slot name="header"></slot>
      </div>
      <div class="common-popup__content">
        <div class="common-popup__wrap">
          <slot name="content"></slot>
        </div>
      </div>
    </custom-scrollbar>
    <div class="common-popup__buttons" :class="{ border: isHasScroll() }">
      <div class="common-popup__buttons-cancel">
        <slot name="button-left"></slot>
      </div>
      <div class="common-popup__buttons-send">
        <slot name="button-right"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "CommonPopup",
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";

const commonPopupScrollRef = ref(null);
defineExpose({ commonPopupScrollRef });

const isHasScroll = () => {
  if (commonPopupScrollRef.value) {
    return (commonPopupScrollRef.value as HTMLElement).$el.classList.contains(
      "ps--active-y"
    );
  }

  return false;
};
</script>

<style lang="less">
@import "~@/providers/ethereum/ui/styles/common-popup.less";
@import "~@action/styles/custom-scroll.less";
</style>
