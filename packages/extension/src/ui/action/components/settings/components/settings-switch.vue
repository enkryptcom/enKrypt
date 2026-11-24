<template>
  <div
    class="settings-switch"
    :class="{ 'settings-switch-has-border': hasBorder }"
  >
    <h5>{{ title }}</h5>
    <div class="settings-switch__switch">
      <Switch v-bind="$attrs" :is-checked="isChecked" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Switch from '@action/components/switch/index.vue';

defineProps({
  title: {
    type: String,
    default: () => {
      return '';
    },
  },
  isChecked: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  hasBorder: {
    type: Boolean,
    default: () => {
      return true;
    },
  },
});
</script>

<style lang="less">
@import '@action/styles/theme.less';

.settings-switch {
  height: 48px;
  background: #ffffff;
  margin: 0 32px;
  box-sizing: border-box;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~'100% - 64px');
  display: block;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;

  &:last-child {
    margin-bottom: 0;
  }

  &-has-border {
    border: 1px solid @gray02;
    padding: 12px 16px;
    margin: 0 32px 12px 32px;
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

  &__switch {
    position: absolute;
    font-size: 0;
    padding: 4px;
    right: 8px;
    top: 50%;
    margin-top: -16px;
  }
}
</style>
