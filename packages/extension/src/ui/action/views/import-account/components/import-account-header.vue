<template>
  <div class="import-account-header">
    <a v-if="isBack" class="import-account-header__back" @click="$emit('back')">
      <arrow-back />
    </a>
    <a class="import-account-header__close" @click="$emit('close')">
      <close-icon />
    </a>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from "@action/icons/common/close-icon.vue";
import ArrowBack from "@action/icons/common/arrow-back.vue";

defineEmits<{
  (e: "close"): void;
  (e: "back"): void;
}>();

defineProps({
  isBack: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.import-account-header {
  width: 100%;
  height: 56px;
  background: @white;
  box-sizing: border-box;
  padding: 14px 56px 14px 56px;

  &__back {
    position: absolute;
    top: 8px;
    left: 8px;
    border-radius: 8px;
    cursor: pointer;
    padding: 8px;
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }
}
</style>
