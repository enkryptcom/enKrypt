<template>
  <div class="send-address-input" :class="{ focus: isFocus }">
    <div class="send-address-input__avatar">
      <img v-if="isAddressValid" :src="network.identicon(xecAddress)" alt="" />
    </div>
    <div class="send-address-input__address">
      <p>{{ from ? 'From:' : 'To:' }}</p>
      <input
        ref="addressInput"
        v-model="address"
        type="text"
        :disabled="disableDirectInput"
        placeholder="address"
        :style="{ color: isAddressValid ? 'black' : 'red' }"
        @focus="changeFocus"
        @blur="changeFocus"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { replaceWithEllipsis } from '@/ui/action/utils/filters';
import { computed, ref, type PropType } from 'vue';
import { ECashNetwork } from '@/providers/ecash/networks/ecash-base';
import { isValidECashAddress } from '@/providers/ecash/libs/utils';

const isFocus = ref<boolean>(false);
const addressInput = ref<HTMLInputElement>();

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  network: {
    type: Object as PropType<ECashNetwork>,
    default: () => ({}),
  },
  from: {
    type: Boolean,
    default: false,
  },
  disableDirectInput: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'update:inputAddress', address: string): void;
  (e: 'toggle:showContacts', show: boolean): void;
}>();

const xecAddress = computed(() => {
  if (props.value && props.value.length > 66) {
    return props.network.displayAddress(props.value);
  }
  return props.value;
});

const isAddressValid = computed(() => {
  return isValidECashAddress(xecAddress.value);
});

const address = computed({
  get: () => {
    return isFocus.value
      ? xecAddress.value
      : replaceWithEllipsis(xecAddress.value, 6, 6);
  },
  set: (value: string) => {
    emit('update:inputAddress', value);
  },
});

const pasteFromClipboard = async () => {
  try {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      console.warn(
        '⚠️ Clipboard API not supported, falling back to execCommand',
      );
      addressInput.value?.focus();
      document.execCommand('paste');
      return;
    }

    const text = await navigator.clipboard.readText();

    if (text) {
      emit('update:inputAddress', text.trim());
      addressInput.value?.focus();
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      console.warn(
        '⚠️ Clipboard access denied. User needs to grant permissions.',
      );
      alert('Please allow clipboard access to paste addresses.');
    } else {
      console.error('❌ Error reading clipboard:', error);
      addressInput.value?.focus();
      document.execCommand('paste');
    }
  }
};

const changeFocus = (event: FocusEvent) => {
  const isFocusing = event.type === 'focus';
  isFocus.value = isFocusing;

  if (isFocusing) {
    emit('toggle:showContacts', true);
  }
};

defineExpose({ addressInput, pasteFromClipboard });
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-address-input {
  height: 64px;
  background: #ffffff;
  margin: 12px 32px 8px 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
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
}
</style>
