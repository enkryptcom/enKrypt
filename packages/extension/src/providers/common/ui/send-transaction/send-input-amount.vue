<template>
  <div class="send-input-amount" :class="{ focus: isFocus }">
    <input
      ref="inputRef"
      v-model="amount"
      type="text"
      placeholder="0"
      :style="{ color: !hasEnoughBalance ? 'red' : 'black' }"
      @keypress="onlyNumber"
      @focus="changeFocus"
      @blur="changeFocus"
    />

    <div class="send-input-amount__fiat">
      <switch-arrow-icon />
      <span>{{ $filters.parseCurrency(fiatEquivalent) }}</span>
    </div>

    <a
      v-show="showMax"
      class="send-input-amount__max"
      @click="emit('update:inputSetMax')"
    >
      Max
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, ComponentPublicInstance } from 'vue';
import SwitchArrowIcon from '@action/icons/send/switch-arrow-icon.vue';
import BigNumber from 'bignumber.js';

const emit = defineEmits<{
  (e: 'update:inputAmount', value: string): void;
  (e: 'update:inputSetMax'): void;
}>();

const isFocus = ref(false);
const inputRef = ref<ComponentPublicInstance<HTMLInputElement>>();

defineExpose({ inputRef });

const props = defineProps({
  hasEnoughBalance: {
    type: Boolean,
    default: false,
  },
  fiatValue: {
    type: String,
    default: '1',
  },
  amount: {
    type: String,
    default: '',
  },
  showMax: {
    type: Boolean,
    default: true,
  },
});
const fiatEquivalent = computed(() => {
  return new BigNumber(props.fiatValue).times(props.amount).toString();
});
const amount = computed({
  get: () => props.amount,
  set: value => {
    let fValue = value.toString();
    if (fValue === '.') fValue = '0.';
    emit('update:inputAmount', fValue);
  },
});

const onlyNumber = ($event: KeyboardEvent) => {
  const keyCode = $event.keyCode ? $event.keyCode : $event.which;
  // Numeric
  if (keyCode >= /* 0 */ 48 && keyCode <= /* 9 */ 57) {
    return;
  }
  // Only allow a single period
  if (keyCode === /* '.' */ 46 && amount.value.indexOf('.') === -1) {
    return;
  }
  // Alphabetical (/non-numeric) or mulitple periods. Don't propagate change
  $event.preventDefault();
};
const changeFocus = () => {
  isFocus.value = !isFocus.value;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-input-amount {
  height: 96px;
  margin: 4px 24px 8px 24px;
  box-sizing: border-box;
  border: 1.5px solid rgba(98, 126, 234, 0.15);
  border-radius: 16px;
  width: calc(~'100% - 48px');
  padding: 16px 20px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  position: relative;
  transition: all 200ms ease-in-out;
  box-shadow: 0 2px 8px rgba(98, 126, 234, 0.06);

  &:hover {
    border-color: rgba(98, 126, 234, 0.25);
  }

  &.focus {
    border: 2px solid @primary;
    box-shadow: 0 0 0 3px rgba(98, 126, 234, 0.12);
    padding: 15px 19px;
  }

  input {
    width: 100%;
    height: 42px;
    font-style: normal;
    font-weight: 600;
    font-size: 24px;
    line-height: 42px;
    text-align: left;
    letter-spacing: -0.3px;
    color: @primaryLabel;
    border: 0 none;
    outline: none;
    padding: 0;
    padding-right: 70px;
    caret-color: @primary;
    background: transparent;
    text-overflow: ellipsis;
    overflow: hidden;

    &::placeholder {
      color: @tertiaryLabel;
      opacity: 0.5;
    }
  }

  input[type='number']::-webkit-outer-spin-button,
  input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  &__fiat {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    margin-top: 4px;
    gap: 6px;

    svg {
      flex-shrink: 0;
      opacity: 0.5;
    }

    span {
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.1px;
      color: @secondaryLabel;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__max {
    position: absolute;
    height: 32px;
    padding: 0 14px;
    right: 16px;
    top: 20px;
    background: linear-gradient(135deg, #627eea 0%, #8a64dc 100%);
    border-radius: 10px;
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 32px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: @white;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    display: block;
    transition: all 200ms ease-in-out;
    box-shadow: 0 2px 6px rgba(98, 126, 234, 0.3);
    z-index: 10;
    pointer-events: auto;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(98, 126, 234, 0.4);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 4px rgba(98, 126, 234, 0.3);
    }
  }
}
</style>
