<template>
  <div class="send-address-input" :class="{ focus: isFocus }">
    <div class="send-address-input__avatar">
      <img v-if="isAddress(value)" :src="network.identicon(value)" alt="" />
    </div>
    <div class="send-address-input__address">
      <p>To:</p>
      <input
        ref="addressInput"
        v-model="address"
        type="text"
        placeholder="0x… address or ENS name"
        @focus="changeFocus"
        @blur="changeFocus"
      />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SendAddressInput",
};
</script>

<script setup lang="ts">
import { BaseNetwork } from "@/types/base-network";
import { replaceWithEllipsis } from "@/ui/action/utils/filters";
import { computed } from "@vue/reactivity";
import { PropType, ref } from "vue";
import { isAddress } from "web3-utils";

const isFocus = ref<boolean>(false);
const addressInput = ref<HTMLInputElement>();

const pasteFromClipboard = () => {
  addressInput.value?.focus();
  document.execCommand("paste");
};
defineExpose({ addressInput, pasteFromClipboard });

const props = defineProps({
  value: {
    type: String,
    default: () => {
      return "";
    },
  },
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
});
const emit = defineEmits<{
  (e: "update:inputAddress", address: string): void;
  (e: "toggle:showContacts", show: boolean): void;
}>();
const address = computed({
  get: () =>
    isFocus.value ? props.value : replaceWithEllipsis(props.value, 6, 6),
  set: (value) => emit("update:inputAddress", value),
});

const changeFocus = (val: FocusEvent) => {
  isFocus.value = val.type === "focus";
  if (isFocus.value) emit("toggle:showContacts", isFocus.value);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-address-input {
  height: 64px;
  background: #ffffff;
  margin: 12px 32px 8px 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~"100% - 64px");
  padding: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;

  &.focus {
    border: 1px solid @primary;
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
}
</style>
