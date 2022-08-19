<template>
  <div class="base-input__wrap">
    <input
      v-model="textValue"
      :type="showPassword ? 'text' : type"
      :placeholder="placeholder"
      class="base-input"
      :class="{ error: isError }"
      autofocus
      autocomplete="off"
    />
    <a
      v-if="type == 'password'"
      class="base-input__hide"
      @click="toggleVisibility"
    >
      <visible-icon v-if="showPassword" />
      <hide-icon v-else />
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import HideIcon from "@action/icons/password/hide-icon.vue";
import VisibleIcon from "@action/icons/password/visible-icon.vue";
const showPassword = ref(false);
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
});
const emit = defineEmits(["update:value"]);
const textValue = computed({
  get: () => props.value,
  set: (value) => emit("update:value", value),
});
const toggleVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";
.base-input {
  outline: none;
  background: @white;
  border: 1px solid rgba(95, 99, 104, 0.2);
  border-radius: 10px;
  margin: 0;
  padding: 0 40px 0 12px;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 40px;
  letter-spacing: 0.25px;
  color: @primaryLabel;
  width: 100%;
  box-sizing: border-box;
  &:focus {
    border: 2px solid @primary;
    line-height: 38px;
  }
  &.error {
    border: 2px solid @error;
    line-height: 38px;
  }
  &__wrap {
    position: relative;
  }
  &__hide {
    position: absolute;
    top: 12px;
    right: 12px;
    cursor: pointer;
    &:active {
      opacity: 0.7;
    }
  }
}
</style>
