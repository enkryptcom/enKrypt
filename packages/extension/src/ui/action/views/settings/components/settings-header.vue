<template>
  <div class="settings__header">
    <h2>Settings</h2>

    <a class="settings__close" @click="$emit('window:close')">
      <close-icon />
    </a>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from "@action/icons/common/close-icon.vue";

defineEmits<{
  (e: "window:close"): void;
}>();
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.settings {
  &__header {
    width: 100%;
    height: 68px;
    background: @white;
    box-sizing: border-box;
    padding: 24px 72px 12px 32px;
    margin-bottom: 8px;

    h2 {
      font-style: normal;
      font-weight: bold;
      font-size: 24px;
      line-height: 32px;
      margin: 0;
      color: @primaryLabel;
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
