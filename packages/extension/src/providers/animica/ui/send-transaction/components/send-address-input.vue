<template>
  <div class="send-address-input" :class="{ focus: isFocus }">
    <div class="send-address-input__avatar">
      <img
        v-if="isValidAnimicaAddress && animicaAddress && identiconSrc"
        :src="identiconSrc"
        alt=""
        @error="handleIdenticonError"
      />
      <img
        v-else
        :src="placeholderIdenticonSrc"
        alt=""
        class="send-address-input__avatar-placeholder"
      />
    </div>
    <div class="send-address-input__address">
      <p v-if="!from">To:</p>
      <p v-else>From:</p>
      <input
        ref="addressInput"
        v-model="address"
        type="text"
        :disabled="disableDirectInput"
        placeholder="Enter Animica address"
        :style="{
          color: animicaAddress && !isValidAnimicaAddress ? 'red' : 'black',
        }"
        @focus="changeFocus"
        @blur="changeFocus"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { replaceWithEllipsis } from '@/ui/action/utils/filters';
import { computed, ref, nextTick } from 'vue';
import { PropType } from 'vue';
import { AnimicaNetwork } from '../../../networks/animica-base';

const isFocus = ref<boolean>(false);
const addressInput = ref<HTMLInputElement>();
const identiconError = ref<boolean>(false);

const pasteFromClipboard = () => {
  addressInput.value?.focus();
  document.execCommand('paste');
};
defineExpose({ addressInput, pasteFromClipboard });

const props = defineProps({
  value: {
    type: String,
    default: () => {
      return '';
    },
  },
  network: {
    type: Object as PropType<AnimicaNetwork>,
    default: () => ({}),
  },
  from: {
    type: Boolean,
    default: false,
  },
  disableDirectInput: Boolean,
});

const emit = defineEmits<{
  (e: 'update:inputAddress', address: string): void;
  (e: 'toggle:showContacts', show: boolean): void;
}>();

const animicaAddress = computed(() => {
  return props.value;
});

const isValidAnimicaAddress = computed(() => {
  if (!animicaAddress.value || animicaAddress.value.trim() === '') return false;
  return props.network.isValidAddress(animicaAddress.value);
});

const identiconSrc = computed(() => {
  if (
    !isValidAnimicaAddress.value ||
    !animicaAddress.value ||
    identiconError.value
  ) {
    return null;
  }

  try {
    if (props.network && props.network.identicon) {
      return props.network.identicon(animicaAddress.value);
    }
  } catch (error) {
    console.error('Error generating identicon:', error);
    // Set error state outside of computed property
    nextTick(() => {
      identiconError.value = true;
    });
  }

  return null;
});

const placeholderIdenticonSrc = computed(() => {
  if (props.network && props.network.identicon) {
    return props.network.identicon(
      'anim1zqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    );
  }
  return '';
});

const address = computed({
  get: () => {
    if (!animicaAddress.value || animicaAddress.value.trim() === '') return '';
    return isFocus.value
      ? animicaAddress.value
      : replaceWithEllipsis(animicaAddress.value, 6, 6);
  },
  set: value => emit('update:inputAddress', value),
});

const changeFocus = (val: FocusEvent) => {
  isFocus.value = val.type === 'focus';
  if (isFocus.value) emit('toggle:showContacts', isFocus.value);
};

const handleIdenticonError = () => {
  console.error('Failed to load identicon for address:', animicaAddress.value);
  identiconError.value = true;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.send-address-input {
  height: 64px;
  background: #ffffff;
  margin: 12px 32px 8px 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~'100% - 64px');
  padding: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;

  &.focus {
    border: 2px solid @primary;
    width: calc(~'100% - 62px');
    margin: 12px 31px 8px 31px;
  }

  &__avatar {
    background: @buttonBg;
    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
    width: 32px;
    height: 32px;
    border-radius: 100%;
    overflow: hidden;
    margin-right: 12px;

    img {
      width: 100%;
      height: 100%;
    }
  }

  &__address {
    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @secondaryLabel;
      margin: 0;
    }

    input {
      width: 290px;
      height: 24px;
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      border: 0 none;
      outline: none;
      padding: 0;
    }
  }

  &__arrow {
    position: absolute;
    font-size: 0;
    cursor: pointer;
    padding: 4px;
    right: 8px;
    top: 16px;
  }

  &__avatar-placeholder {
    opacity: 0.6;
  }
}
</style>
