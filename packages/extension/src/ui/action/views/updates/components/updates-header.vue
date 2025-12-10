<template>
  <div class="settings__header">
    <h2>What's New</h2>
    <button
      type="button"
      class="settings__close"
      @click="$emit('window:close')"
      aria-label="Close what's new popup"
    >
      <close-icon />
    </button>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from '@action/icons/common/close-icon.vue';

defineEmits<{
  (e: 'window:close'): void;
}>();
</script>

<style lang="less">
@import '@action/styles/color.less';

.settings {
  &__header {
    width: 100%;
    height: 68px;
    background: @white;
    box-sizing: border-box;
    padding: 24px 72px 12px 32px;
    margin-bottom: 8px;

    button {
      background: none;
      color: inherit;
      border: none;
      padding: 0;
      font: inherit;
      cursor: pointer;
      outline: inherit;
    }

    h2 {
      font-style: normal;
      font-weight: 700;
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
