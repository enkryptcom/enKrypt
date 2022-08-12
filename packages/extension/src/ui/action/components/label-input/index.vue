<template>
  <div class="label-input__wrap" :class="{ error: isError, focus: isFocus }">
    <p v-if="label.length > 0" class="label-input__label">
      {{ label }}
    </p>
    <input
      v-model="textValue"
      :placeholder="placeholder"
      class="label-input"
      autofocus
      autocomplete="off"
      @focus="changeFocus"
      @blur="changeFocus"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const isFocus = ref(false);

const props = defineProps({
  placeholder: {
    type: String,
    default: () => {
      return "";
    },
  },
  type: {
    type: String,
    default: () => {
      return "text";
    },
  },
  value: {
    type: String,
    default: () => {
      return "";
    },
  },
  isError: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  label: {
    type: String,
    default: () => {
      return "";
    },
  },
});
const emit = defineEmits(["update:value"]);
const textValue = computed({
  get: () => props.value,
  set: (value) => emit("update:value", value),
});
const changeFocus = () => {
  isFocus.value = !isFocus.value;
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
.label-input {
  outline: none;
  border: 0 none;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.25px;
  color: @primaryLabel;
  box-sizing: border-box;
  width: 100%;

  &__wrap {
    position: relative;
    background: @white;
    border: 1px solid rgba(95, 99, 104, 0.2);
    border-radius: 10px;
    margin: 0;
    padding: 10px 12px 10px 12px;
    width: 100%;
    box-sizing: border-box;

    &.focus {
      border: 2px solid @primary;
      padding: 9px 11px 9px 11px;
    }
    &.error {
      border: 2px solid @error;
      padding: 9px 11px 9px 11px;
    }
  }

  &__label {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @secondaryLabel;
    margin: 0;
  }
}
</style>
