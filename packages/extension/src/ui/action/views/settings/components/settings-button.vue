<template>
  <a class="settings-button" :class="{ red: isRed }" @click="$emit('click')">
    <h5>{{ title }}</h5>
    <div class="settings-button__arrow">
      <right-arrow v-if="!isLink" />
      <external-icon v-else />
    </div>
  </a>
</template>

<script setup lang="ts">
import RightArrow from "@action/icons/common/right-arrow.vue";
import ExternalIcon from "@action/icons/common/external-icon.vue";
defineEmits<{
  (e: "click"): void;
}>();
defineProps({
  title: {
    type: String,
    default: () => {
      return "";
    },
  },
  isRed: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  isLink: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.settings-button {
  height: 48px;
  background: #ffffff;
  margin: 0 32px 12px 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~"100% - 64px");
  padding: 12px 16px;
  display: block;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  transition: background 300ms ease-in-out;

  &:hover {
    background: @black004;
  }

  &:last-child {
    margin-bottom: 0;
  }

  h5 {
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: @primaryLabel;
    width: 290px;
    margin: 0;
  }

  &__arrow {
    position: absolute;
    font-size: 0;
    padding: 4px;
    right: 8px;
    top: 50%;
    margin-top: -16px;
  }

  &.red {
    background: @error01;
    border: 1px solid @error01;

    h5 {
      color: @error;
    }

    .settings-button__arrow {
      display: none;
    }
  }
}
</style>
