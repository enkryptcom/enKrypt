<template>
  <div class="explore__search">
    <search-icon></search-icon>
    <input type="text" placeholder="Search accounts" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SearchIcon from "@popup/icons/common/search.vue";

export default defineComponent({
  name: "Search",
  components: {
    SearchIcon,
  },
});
</script>

<style lang="less" scoped>
@import "~@popup/styles/theme.less";

.explore__search {
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
