<template>
  <div class="send-address-input" :class="{ focus: isFocus }">
    <div class="send-address-input__avatar">
      <img :src="getImgUrl(value)" alt="" />
    </div>
    <div class="send-address-input__address">
      <p>To:</p>
      <input
        type="text"
        placeholder="0x… address or ENS name"
        :value="isFocus ? value : $filters.replaceWithEllipsis(value, 6, 6)"
        @input="changeValue"
        @focus="changeFocus"
        @blur="changeFocus"
      />
    </div>

    <a class="send-address-input__arrow" @click="open">
      <switch-arrow />
    </a>
  </div>
</template>

<script lang="ts">
export default {
  name: "SendAddressInput",
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import SwitchArrow from "@action/icons/header/switch_arrow.vue";

let isFocus = ref(false);
let isOpen = ref(false);

const props = defineProps({
  input: {
    type: Function,
    default: () => {
      return null;
    },
  },
  toggleSelect: {
    type: Function,
    default: () => {
      return null;
    },
  },
  value: {
    type: String,
    default: () => {
      return "";
    },
  },
  identicon: {
    type: Function,
    default: () => null,
  },
});

const changeValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  props.input(target.value);
};

const changeFocus = () => {
  isFocus.value = !isFocus.value;
};

const open = () => {
  isOpen.value = !isOpen.value;
  props.toggleSelect(isOpen);
};

const getImgUrl = (address: string) => {
  let imgUrl;
  if (props.identicon) {
    imgUrl = props.identicon(address);
  }

  if (imgUrl) return imgUrl;
  return "https://mewcard.mewapi.io/?address=" + address;
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
