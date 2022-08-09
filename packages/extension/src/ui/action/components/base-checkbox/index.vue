<template>
  <label class="base-checkbox">
    <input
      type="checkbox"
      :checked="isChecked"
      :disabled="disabled"
      @change="emit('toggle:select')"
    />
    <div class="base-checkbox__wrap">
      <checkbox-active />
    </div>
  </label>
</template>

<script setup lang="ts">
import CheckboxActive from "@action/icons/common/checkbox-active.vue";

const emit = defineEmits<{
  (e: "toggle:select"): void;
}>();
defineProps({
  isChecked: Boolean,
  disabled: Boolean,
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.base-checkbox {
  width: 24px;
  height: 24px;
  display: block;
  cursor: pointer;

  &__wrap {
    width: 18px;
    height: 18px;
    background: @white;
    border: 2px solid @secondaryLabel;
    box-sizing: border-box;
    border-radius: 2px;
    text-align: center;

    svg {
      display: none;
    }
  }

  input {
    opacity: 0;
    width: 0;
    height: 0;
    display: none;

    &:checked {
      & + .base-checkbox__wrap {
        border: 0 none;
        background-color: @white;
        svg {
          display: block;
        }
      }
    }
  }
}
</style>
