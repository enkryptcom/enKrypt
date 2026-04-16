<template>
  <div class="send-address-input" :class="{ focus: isFocus }">
    <div class="send-address-input__avatar">
      <img
        v-if="network.isAddress(value)"
        :src="network.identicon(value)"
        alt=""
      />
    </div>
    <div class="send-address-input__address">
      <p v-if="!from">To:</p>
      <p v-else>From:</p>
      <input
        ref="addressInput"
        v-model="address"
        type="text"
        :readonly="disableDirectInput"
        placeholder="0x… address"
        :style="{
          color: !network.isAddress(value) ? 'red' : 'black',
        }"
        @focus="changeFocus"
        @blur="changeFocus"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { EvmNetwork } from '@/providers/ethereum/types/evm-network';
import { replaceWithEllipsis } from '@/ui/action/utils/filters';
import { computed } from 'vue';
import { PropType, ref } from 'vue';

const isFocus = ref<boolean>(false);
const addressInput = ref<HTMLInputElement>();

const pasteFromClipboard = () => {
  addressInput.value?.focus();
  // Clear existing data from address field
  if (addressInput.value) {
    addressInput.value.value = '';
  }
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
    type: Object as PropType<EvmNetwork>,
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
const visibleAddress = computed(() => {
  let address = props.value;
  if (props.network.isAddress(address))
    address = props.network.displayAddress(props.value);
  if (isFocus.value) return address;
  if (address.length < 13) return address;
  return replaceWithEllipsis(address, 6, 6);
});
const address = computed({
  get: () => visibleAddress.value,
  set: value => emit('update:inputAddress', value),
});

const changeFocus = (val: FocusEvent) => {
  isFocus.value = val.type === 'focus';
  if (isFocus.value) emit('toggle:showContacts', isFocus.value);
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-address-input {
  height: 60px;
  background: @white;
  margin: 8px 24px;
  box-sizing: border-box;
  border: 1.5px solid rgba(98, 126, 234, 0.15);
  border-radius: 14px;
  width: calc(~'100% - 48px');
  padding: 12px 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  transition: all 200ms ease-in-out;
  box-shadow: 0 2px 8px rgba(98, 126, 234, 0.06);

  &:hover {
    border-color: rgba(98, 126, 234, 0.25);
    box-shadow: 0 2px 8px rgba(98, 126, 234, 0.08);
  }

  &.focus {
    border: 2px solid @primary;
    box-shadow: 0 0 0 3px rgba(98, 126, 234, 0.12);
    margin: 8px 24px;
    width: calc(~'100% - 48px');
    padding: 11px 15px;
  }

  &__avatar {
    box-shadow: inset 0px 0px 2px rgba(0, 0, 0, 0.08);
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 12px;
    overflow: hidden;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__address {
    flex: 1;
    min-width: 0;

    p {
      font-style: normal;
      font-weight: 500;
      font-size: 11px;
      line-height: 14px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: @secondaryLabel;
      margin: 0 0 2px 0;
    }

    input {
      width: 100%;
      height: 22px;
      font-style: normal;
      font-weight: 500;
      font-size: 15px;
      line-height: 22px;
      letter-spacing: 0.1px;
      color: @primaryLabel;
      border: 0 none;
      outline: none;
      padding: 0;
      background: transparent;
      text-overflow: ellipsis;

      &::placeholder {
        color: @tertiaryLabel;
        font-weight: 400;
      }

      &:disabled {
        cursor: pointer;
        opacity: 1;
      }
    }
  }

  &__arrow {
    position: absolute;
    font-size: 0;
    cursor: pointer;
    padding: 6px;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 8px;
    transition: background 150ms ease-in-out;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
}
</style>
