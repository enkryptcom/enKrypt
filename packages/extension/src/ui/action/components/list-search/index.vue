<template>
  <div class="list-search">
    <search-icon />
    <input type="text" :placeholder="placeholder" @input="changeValue" />
  </div>
</template>

<script setup lang="ts">
import SearchIcon from "@action/icons/common/search.vue";

const props = defineProps({
  input: {
    type: Function,
    default: () => {
      return null;
    },
  },
  placeholder: {
    type: String,
    default: () => {
      return "";
    },
  },
});

const changeValue = (event: Event) => {
  const inputTarget = event.target as HTMLInputElement;
  props.input(inputTarget.value);
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.list-search {
  width: 100%;
  height: 56px;
  background: @primaryBg;
  position: relative;
  box-sizing: border-box;
  padding: 17px 20px 17px 56px;
  border-bottom: 1px solid @gray02;
  position: absolute;
  left: 0;
  top: 0;

  svg {
    position: absolute;
    left: 16px;
    top: 16px;
  }

  input {
    width: 100%;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @primaryLabel;
    border: 0 none;
    outline: none;
  }
}
</style>
