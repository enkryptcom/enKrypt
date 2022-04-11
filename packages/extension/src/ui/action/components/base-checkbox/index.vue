<template>
  <label class="base-checkbox">
    <input
      type="checkbox"
      :checked="isChecked"
      @change="checkLocal($event)" />
    <div class="base-checkbox__wrap">
      <checkbox-active />
    </div>
  </label>
</template>

<script lang="ts">
export default {
  name: "PhraseCheckbox",
};
</script>

<script setup lang="ts">
import { defineProps } from "vue";
import CheckboxActive from "@action/icons/common/checkbox-active.vue"

const props = defineProps({
  isChecked: Boolean,
  check: {
    type: Function,
    default: () => ({}),
  },
});

const checkLocal = (e: any) => {
  props.check(e.target.checked);
};
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

        svg {
          display: block;
        }
      }
    }
  }
}
</style>
