<template>
  <div class="add-network__header" :class="{ border: isScroll }">
    <h3>Manage networks {{ isScroll }}</h3>

    <a class="add-network__close" @click="close()">
      <close-icon />
    </a>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from "@action/icons/common/close-icon.vue";

defineProps({
  close: {
    type: Function,
    default: () => ({}),
  },
  isScroll: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.add-network {
  &__header {
    width: 100%;
    background: @white;
    box-sizing: border-box;
    padding: 24px 72px 12px 32px;
    position: relative;
    z-index: 4;

    h3 {
      font-style: normal;
      font-weight: bold;
      font-size: 24px;
      line-height: 32px;
      margin: 0;
      color: @primaryLabel;
    }

    &.border {
      box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05),
        0px 0px 1px rgba(0, 0, 0, 0.25);
      padding: 14px 72px 12px 32px;

      h3 {
        font-size: 20px;
        line-height: 28px;
      }
    }
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }
  }
}
</style>
