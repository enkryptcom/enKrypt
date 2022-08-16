<template>
  <div class="app-search" :class="{ border: isBorder, focus: isFocus }">
    <search-icon class="app-search__icon" />
    <input
      v-model="textValue"
      type="text"
      placeholder="Search networks"
      class="app-search__input"
      :class="{ border: isBorder }"
      autocomplete="off"
      @focus="changeFocus"
      @blur="changeFocus"
    />
    <a v-if="textValue.length > 0" class="app-search__clear" @click="clear">
      <clear-icon />
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import SearchIcon from "@action/icons/common/search.vue";
import ClearIcon from "@action/icons/common/clear-icon.vue";

const isFocus = ref(false);

const props = defineProps({
  isBorder: {
    type: Boolean,
    default: () => {
      return {};
    },
  },
  value: {
    type: String,
    default: () => {
      return "";
    },
  },
});

const changeFocus = () => {
  isFocus.value = !isFocus.value;
};

const clear = () => {
  emit("update:value", "");
};

const emit = defineEmits(["update:value"]);

const textValue = computed({
  get: () => props.value,
  set: (value) => emit("update:value", value),
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.app-search {
  background: transparent;
  border-radius: 10px;
  margin: 17px 0 8px 0;
  height: 40px;
  width: 100%;
  position: relative;
  padding-left: 40px;
  padding-right: 40px;
  box-sizing: border-box;
  border: 1px solid @gray02;

  &.border {
    border: 1px solid @gray02 !important;
    box-shadow: none !important;
    margin: 0;
    background: @white;
  }

  &.focus {
    background: @white;
    box-shadow: 0px 0.25px 1px rgba(0, 0, 0, 0.039),
      0px 0.85px 3px rgba(0, 0, 0, 0.19);
    border-color: @white;
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
    line-height: 38px;
    letter-spacing: 0.25px;
    background: none;
    color: @primaryLabel;
    width: 100%;

    &.border {
      line-height: 38px;
    }

    &::placeholder {
      color: @tertiaryLabel;
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
