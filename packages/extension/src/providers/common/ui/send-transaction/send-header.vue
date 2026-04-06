<template>
  <div class="send-transaction__header">
    <a class="send-transaction__selector">
      <span v-if="isSendToken">Send token</span>
      <span v-else>Send NFT</span>
      <switch-arrow
        v-if="isNftAvailable"
        @click="toggleSelector"
      ></switch-arrow>
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
    <a class="send-transaction__close" @click="$emit('close')">
      <close-icon />
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CloseIcon from '@action/icons/common/close-icon.vue';
import SwitchArrow from '@action/icons/header/switch_arrow.vue';
import DoneIcon from '@action/icons/common/done_icon.vue';

const isOpenSelector = ref(false);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'toggleType', val: boolean): void;
}>();

defineProps({
  isSendToken: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  isNftAvailable: {
    type: Boolean,
    default: false,
  },
});

const toggleSelector = () => {
  isOpenSelector.value = !isOpenSelector.value;
};

const toggleType = (isTokenSend: boolean) => {
  isOpenSelector.value = false;
  emit('toggleType', isTokenSend);
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

.send-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;

  &__header {
    position: relative;
    padding: 20px 24px 16px 24px;
    background: linear-gradient(
      135deg,
      rgba(98, 126, 234, 0.08) 0%,
      rgba(138, 100, 220, 0.05) 100%
    );
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  }

  &__close {
    position: absolute;
    top: 12px;
    right: 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 200ms ease-in-out;
    font-size: 0;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__selector {
    font-style: normal;
    font-weight: 700;
    font-size: 22px;
    line-height: 28px;
    color: @primaryLabel;
    margin: 0;
    text-decoration: none;
    display: inline-flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    cursor: pointer;
    gap: 6px;
    padding: 4px 8px 4px 0;
    border-radius: 8px;
    transition: background 200ms ease-in-out;

    span {
      background: linear-gradient(135deg, #627eea 0%, #8a64dc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    svg {
      opacity: 0.7;
      transition: all 200ms ease-in-out;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.04);

      svg {
        opacity: 1;
        transform: translateY(2px);
      }
    }
  }

  &__dropdown {
    position: absolute;
    width: 200px;
    padding: 6px;
    background: @white;
    box-shadow:
      0px 4px 16px rgba(0, 0, 0, 0.12),
      0px 1px 4px rgba(0, 0, 0, 0.08);
    border-radius: 14px;
    box-sizing: border-box;
    left: 24px;
    top: 52px;
    z-index: 10;
    animation: dropdownFadeIn 150ms ease-out;

    @keyframes dropdownFadeIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    &-item {
      width: 100%;
      height: 44px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: row;
      cursor: pointer;
      padding: 0 12px;
      box-sizing: border-box;
      text-decoration: none;
      border-radius: 10px;
      transition: background 150ms ease-in-out;

      &:hover {
        background: rgba(98, 126, 234, 0.08);
      }

      p {
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.15px;
        color: @primaryLabel;
        margin: 0;
      }

      svg {
        color: @primary;
      }
    }
  }
}
</style>
