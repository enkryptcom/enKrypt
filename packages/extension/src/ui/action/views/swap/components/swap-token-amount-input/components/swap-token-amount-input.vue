<template>
  <input
    ref="swapAmountInput"
    v-model="textValue"
    type="text"
    :placeholder="placeholder"
    autocomplete="off"
    :class="`swap-token-amount-input
  ${!error || 'swap-token-amount-error'}`"
    @focus="changeFocus"
    @blur="changeFocus"
    @keypress="onlyNumber"
  />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

const isFocus = ref(false);
const swapAmountInput = ref(null);

defineExpose({ swapAmountInput });

const props = defineProps({
  placeholder: {
    type: String,
    default: () => {
      return '';
    },
  },
  value: {
    type: String,
    default: () => {
      return '';
    },
  },
  changeFocus: {
    type: Function,
    default: () => {
      return null;
    },
  },
  autofocus: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  error: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});

onMounted(() => {
  if (swapAmountInput.value && props.autofocus) {
    (swapAmountInput.value as HTMLInputElement).focus();
  }
});

const emit = defineEmits(['update:value']);

const textValue = computed({
  get: () => props.value,
  set: value => {
    let fValue = value.toString();
    if (fValue === '.') fValue = '0.';
    emit('update:value', fValue);
  },
});

const changeFocus = () => {
  isFocus.value = !isFocus.value;
  props.changeFocus(isFocus.value);
};

const onlyNumber = ($event: KeyboardEvent) => {
  const keyCode = $event.keyCode ? $event.keyCode : $event.which;
  // Numeric
  if (keyCode >= /* 0 */ 48 && keyCode <= /* 9 */ 57) {
    return;
  }
  // Only allow a single period
  if (keyCode === /* '.' */ 46 && textValue.value.indexOf('.') === -1) {
    return;
  }
  // Alphabetical (/non-numeric) or mulitple periods. Don't propagate change
  $event.preventDefault();
};
</script>

<style lang="less">
@import '@action/styles/theme.less';
.swap-token-amount-input {
  outline: none;
  background: @white;
  margin: 0;
  padding: 0 76px 0 16px;
  font-style: normal;
  font-weight: 400;
  font-size: 34px;
  line-height: 40px;
  letter-spacing: 0.25px;
  color: @primaryLabel;
  width: 100%;
  box-sizing: border-box;
  border: 0 none;
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  &::placeholder {
    color: @tertiaryLabel;
  }
}

.swap-token-amount-error {
  color: @error !important;
}
</style>
