<template>
  <a class="base-select__option" @click="select()">
    <h5>{{ title }}</h5>
  </a>
</template>

<script lang="ts">
export default {
  name: "BaseSelectOption",
};
</script>

<script setup lang="ts">
const props = defineProps({
  select: {
    type: Function,
    default: () => {
      return null;
    },
  },
  title: {
    type: String,
    default: () => {
      return "";
    },
  },
});

const select = () => {
  props.select(props.title);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.base-select {
  &__option {
    width: 100%;
    text-decoration: none;
    cursor: pointer;
    height: 44px;
    padding-left: 12px;
    box-sizing: border-box;
    display: block;

    h5 {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 44px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      margin: 0;
    }
  }
}
</style>
