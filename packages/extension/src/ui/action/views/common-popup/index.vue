<template>
  <div class="common-popup">
    <custom-scrollbar
      ref="commonPopupScrollRef"
      class="common-popup__scroll-area"
    >
      <div class="common-popup__header">
        <slot name="header" />
      </div>
      <div class="common-popup__content">
        <div class="common-popup__wrap">
          <slot name="content" />
        </div>
      </div>
    </custom-scrollbar>
    <div class="common-popup__buttons" :class="{ border: isHasScroll() }">
      <div class="common-popup__buttons-cancel">
        <slot name="button-left" />
      </div>
      <div class="common-popup__buttons-send">
        <slot name="button-right" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ComponentPublicInstance, ref } from "vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";

const commonPopupScrollRef = ref<ComponentPublicInstance<HTMLElement>>();
defineExpose({ commonPopupScrollRef });

const isHasScroll = () => {
  if (commonPopupScrollRef.value) {
    return commonPopupScrollRef.value.$el.classList.contains("ps--active-y");
  }

  return false;
};
</script>

<style lang="less" scoped>
@import "~@/providers/ethereum/ui/styles/common-popup.less";
@import "~@action/styles/custom-scroll.less";
</style>
