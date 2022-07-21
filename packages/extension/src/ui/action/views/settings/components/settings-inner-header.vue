<template>
  <div class="settings__inner-header">
    <a class="settings__back" @click="$emit('window:back')">
      <arrow-back />
    </a>
    <h2 v-show="isGeneral">General</h2>
    <h2 v-show="isAbout">About</h2>
    <h2 v-show="isSupport">Support</h2>
    <h2 v-show="isPhrase">Recovery phrase</h2>
    <h2 v-show="isReset">Reset wallet?</h2>

    <a class="settings__close" @click="$emit('window:close')">
      <close-icon />
    </a>
  </div>
</template>

<script setup lang="ts">
import CloseIcon from "@action/icons/common/close-icon.vue";
import ArrowBack from "@action/icons/common/arrow-back.vue";
defineEmits<{
  (e: "window:close"): void;
  (e: "window:back"): void;
}>();
defineProps({
  isGeneral: {
    type: Boolean,
    default: false,
  },
  isSupport: {
    type: Boolean,
    default: false,
  },
  isAbout: {
    type: Boolean,
    default: false,
  },
  isPhrase: {
    type: Boolean,
    default: false,
  },
  isReset: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.settings {
  &__inner-header {
    width: 100%;
    height: 56px;
    background: @white;
    box-sizing: border-box;
    padding: 14px 56px 14px 56px;

    h2 {
      font-style: normal;
      font-weight: bold;
      font-size: 20px;
      line-height: 28px;
      margin: 0;
      color: @primaryLabel;
      text-align: center;
    }
  }

  &__back {
    position: absolute;
    top: 8px;
    left: 8px;
    border-radius: 8px;
    cursor: pointer;
    padding: 8px;
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }
}
</style>
