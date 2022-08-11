<template>
  <div class="send-transaction__header">
    <a class="send-transaction__selector">
      <span v-if="isSendToken">Send token</span>
      <!-- <span v-else>Send NFT</span>
      <switch-arrow></switch-arrow> -->
    </a>
    <div v-show="isOpenSelector" class="send-transaction__dropdown">
      <a class="send-transaction__dropdown-item" @click="toggleType(true)">
        <p>Send token</p>
        <done-icon v-show="isSendToken" />
      </a>
      <a class="send-transaction__dropdown-item" @click="toggleType(false)">
        <p>Send NFT</p>
        <done-icon v-show="!isSendToken" />
      </a>
    </div>
    <a class="send-transaction__close" @click="close">
      <close-icon />
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from "vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
// import SwitchArrow from "@action/icons/header/switch_arrow.vue";
import DoneIcon from "@action/icons/common/done_icon.vue";

const isOpenSelector = ref(false);

const props = defineProps({
  close: {
    type: Function as PropType<() => void>,
    default: () => {
      return null;
    },
  },
  toggleType: {
    type: Function as PropType<(isTokenSend: boolean) => void>,
    default: () => {
      return null;
    },
  },
  isSendToken: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});

// const toggleSelector = () => {
//   isOpenSelector.value = !isOpenSelector.value;
// };

const toggleType = (isTokenSend: boolean) => {
  isOpenSelector.value = false;
  props.toggleType(isTokenSend);
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.send-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;

  &__header {
    position: relative;
    padding: 24px 72px 12px 32px;
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }

  &__selector {
    font-style: normal;
    font-weight: 700;
    font-size: 24px;
    line-height: 32px;
    color: @primaryLabel;
    margin: 0;
    text-decoration: none;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    cursor: pointer;
  }

  &__dropdown {
    position: absolute;
    width: 220px;
    height: 112px;
    padding: 8px;
    background: @white;
    box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
      0px 3.75px 11px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    box-sizing: border-box;
    left: 32px;
    top: 56px;
    z-index: 1;

    &-item {
      width: 100%;
      height: 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: row;
      cursor: pointer;
      padding: 0 12px 0 16px;
      box-sizing: border-box;
      text-decoration: none;
      border-radius: 8px;
      transition: background 300ms ease-in-out;

      &:hover {
        background: @black007;
      }

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;

        color: @primaryLabel;
      }
    }
  }
}
</style>
