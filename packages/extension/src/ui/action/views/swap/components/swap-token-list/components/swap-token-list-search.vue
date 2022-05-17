<template>
  <div class="swap-token-list-search">
    <search-icon></search-icon>
    <input type="text" placeholder="Search tokens" autocomplete="off" />
  </div>
</template>

<script lang="ts">
export default {
  name: "SwapTokenListSearch",
};
</script>

<script setup lang="ts">
import SearchIcon from "@action/icons/common/search.vue";
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.swap-token-list-search {
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
