<template>
  <div class="base-input__wrap">
    <input
      v-model="text"
      :type="showPassword ? 'text' : type"
      :placeholder="placeholder"
      class="base-input"
      :class="{ error: isError }"
      @input="changeValue($event.target.value)"
    />
    <a
      v-if="type == 'password'"
      class="base-input__hide"
      @click="toggleVisibility"
    >
      <hide-icon />
    </a>
  </div>
</template>

<script lang="ts">
export default {
  name: "BaseInput",
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import HideIcon from "@action/icons/password/hide-icon.vue";

let showPassword = ref(false);
let text = "";

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
  input: {
    type: Function,
    default: () => {
      return null;
    },
  },
});

const changeValue = (text: string) => {
  props.input(text);
};
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
  background: none;
  color: @primaryLabel;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border: 1.5px solid @primary;
    line-height: 39px;
  }

  &.error {
    border: 1.5px solid @error;
    line-height: 39px;
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
