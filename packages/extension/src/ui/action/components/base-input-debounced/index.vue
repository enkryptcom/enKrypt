<template>
  <div class="explore__search">
    <span class="explore__search-icon"><search-icon /></span>
    <input
      v-model="inputText"
      :type="type"
      :placeholder="placeholder"
      autocomplete="off"
      autofocus
      @input="onUserInput"
    />

    <a
      v-if="inputText && inputText.length > 0"
      class="explore__search-clear"
      @click="clear"
    >
      <clear-icon />
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SearchIcon from '@action/icons/common/search.vue';
import ClearIcon from '@action/icons/common/clear-icon.vue';

const inputText = ref<string>('');
defineProps({
  placeholder: {
    type: String,
    default: () => {
      return '';
    },
  },
  type: {
    type: String,
    default: () => {
      return 'text';
    },
  },
});

const emit = defineEmits<{
  (e: 'update:valueDebounced', data: string): void;
}>();

const clear = () => {
  inputText.value = '';
  emit('update:valueDebounced', inputText.value);
};

/*
  ========================
    Input debouncing
  ========================
  */
const timeout = ref(0);

/**
 * Emits user input to parent with the timeout of 600
 */
const onUserInput = (): void => {
  clearTimeout(timeout.value);
  timeout.value = window.setTimeout(() => {
    if (!inputText.value) {
      inputText.value = '';
    }
    emit('update:valueDebounced', inputText.value);
  }, 600);
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.explore__search {
  width: 100%;
  height: 56px;
  background: @primaryBg;
  position: relative;
  box-sizing: border-box;
  padding: 17px 48px 17px 56px;
  border-bottom: 1px solid @gray02;
  position: absolute;
  left: 0;
  top: 0;

  &-icon {
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

    &::placeholder {
      color: @tertiaryLabel;
    }
  }

  &-clear {
    position: absolute;
    right: 16px;
    top: 50%;
    cursor: pointer;
    margin-top: -8px;
  }
}
</style>
