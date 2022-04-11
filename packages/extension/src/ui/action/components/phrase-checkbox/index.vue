<template>
  <label class="phrase-checkbox">
    <input type="checkbox" :checked="isChecked" @change="checkLocal($event)" />
    <div class="base-checkbox__wrap">
      <span>{{ title }}</span>
    </div>
  </label>
</template>

<script lang="ts">
export default {
  name: "PhraseCheckbox",
};
</script>

<script setup lang="ts">
const props = defineProps({
  isChecked: Boolean,
  title: {
    type: String,
    default: "",
  },
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
      & + .base-checkbox__wrap {
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
