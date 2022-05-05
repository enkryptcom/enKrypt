<template>
  <div class="app-search" :class="{ border: isBorder, focus: isFocus }">
    <search-icon class="app-search__icon" />
    <input
      v-model="searchText"
      type="text"
      placeholder="Search networks"
      class="app-search__input"
      :class="{ border: isBorder }"
      @focus="changeFocus"
      @blur="changeFocus"
      @input="changeValue"
    />
    <a v-if="searchText.length > 0" class="app-search__clear" @click="clear">
      <clear-icon />
    </a>
  </div>
</template>

<script lang="ts">
export default {
  name: "BaseSearch",
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import SearchIcon from "@action/icons/common/search.vue";
import ClearIcon from "@action/icons/common/clear-icon.vue";

let isFocus = ref(false);
let searchText = ref("");

const props = defineProps({
  isBorder: {
    type: Boolean,
    default: () => {
      return {};
    },
  },
  input: {
    type: Function,
    default: () => {
      return null;
    },
  },
});

const changeFocus = () => {
  isFocus.value = !isFocus.value;
};

const changeValue = (e: any) => {
  searchText.value = e.target.value;
  props.input(e.target.value);
};

const clear = () => {
  searchText.value = "";
  props.input("");
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.app-search {
  background: @gray01;
  border-radius: 10px;
  margin: 17px 0 8px 0;
  height: 40px;
  width: 100%;
  position: relative;
  padding-left: 40px;
  padding-right: 40px;
  box-sizing: border-box;

  &.border {
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: none !important;
    margin: 0;
    background: @white;
  }

  &.focus {
    background: @white;
    box-shadow: 0px 0.25px 1px rgba(0, 0, 0, 0.039),
      0px 0.85px 3px rgba(0, 0, 0, 0.19);
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
    width: 100%;

    &.border {
      line-height: 38px;
    }
  }

  &__clear {
    position: absolute;
    right: 12px;
    top: 12px;
    cursor: pointer;
  }
}
</style>
