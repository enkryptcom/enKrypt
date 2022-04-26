<template>
  <label class="phrase-checkbox">
    <input v-model="checked" type="checkbox" />
    <div class="phrase-checkbox__wrap">
      <span>{{ title }}</span>
    </div>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  isChecked: Boolean,
  title: {
    type: String,
    default: "",
  },
});
const emit = defineEmits<{
  (e: "update:checked", checked: boolean): void;
}>();
const checked = computed<boolean>({
  get: () => props.isChecked,
  set: (value) => emit("update:checked", value),
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.phrase-checkbox {
  width: 110px;
  height: 40px;
  display: block;
  cursor: pointer;

  &__wrap {
    width: 110px;
    height: 40px;
    background: @white;
    border: 1px solid rgba(95, 99, 104, 0.2);
    box-sizing: border-box;
    border-radius: 10px;
    text-align: center;

    span {
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 38px;
      text-align: center;
      letter-spacing: 0.25px;
      color: @primaryLabel;
    }
  }

  input {
    opacity: 0;
    width: 0;
    height: 0;
    display: none;

    &:checked {
      & + .phrase-checkbox__wrap {
        background: @primary;
        border: 0 none;

        span {
          color: @white;
          line-height: 40px;
        }
      }
    }
  }
}
</style>
