<template>
  <div class="app-search" :class="{ border: isBorder }">
    <SearchIcon class="app-search__icon" />
    <input
      type="text"
      value=""
      placeholder="Search networks"
      class="app-search__input"
      :class="{ border: isBorder }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SearchIcon from "../../icons/common/search.vue";

export default defineComponent({
  name: "AppSearch",
  components: {
    SearchIcon,
  },
  props: {
    isBorder: Boolean,
  },
});
</script>

<style lang="less">
@import "../../theme/theme.less";

.app-search {
  background: @white;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  margin: 17px 0 8px 0;
  height: 40px;
  width: 100%;
  position: relative;
  padding-left: 40px;
  box-sizing: border-box;

  &.border {
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: none;
    margin: 0;
  }

  &__icon {
    position: absolute;
    left: 8px;
    top: 8px;
  }

  &__input {
    outline: none;
    border: 0 none;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 40px;
    letter-spacing: 0.25px;
    background: none;
    color: @primaryLabel;

    &.border {
      line-height: 38px;
    }
  }
}
</style>
