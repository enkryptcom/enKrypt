<template>
  <div class="assets-select-list-search">
    <search-icon />
    <input
      ref="searchInput"
      type="text"
      placeholder="Search tokens by name, ticker, or address"
      autocomplete="off"
      @input="searchUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import SearchIcon from "@action/icons/common/search.vue";
import { ref } from "vue";

const emit = defineEmits<{
  (e: "update:tokenSearchInput", searchQuery: string): void;
}>();

const searchInput = ref<HTMLInputElement>();

const searchUpdate = () => {
  if (searchInput.value) {
    emit("update:tokenSearchInput", searchInput.value.value);
  }
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.assets-select-list-search {
  width: 100%;
  height: 56px;
  background: @primaryBg;
  position: relative;
  box-sizing: border-box;
  padding: 17px 20px 17px 56px;
  border-bottom: 1px solid @gray02;

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
