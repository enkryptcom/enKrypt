<template>
  <a class="base-select__option" @click="select()">
    <div class="base-select__option__img-container">
      <img :src="flag" width="40" height="40" />
    </div>
    <div>
      <h5>{{ title }}</h5>
      <done-icon v-show="isSelect" />
    </div>
  </a>
</template>

<script setup lang="ts">
import DoneIcon from '@action/icons/common/done_icon.vue';
const props = defineProps({
  select: {
    type: Function,
    default: () => {
      return null;
    },
  },
  title: {
    type: String,
    default: () => {
      return '';
    },
  },
  isSelect: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  flag: {
    type: String,
    default: () => {
      return '';
    },
  },
});

const select = () => {
  props.select(props.title);
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.base-select {
  &__option {
    width: 100%;
    text-decoration: none;
    cursor: pointer;
    padding: 10px 0 10px 12px;
    box-sizing: border-box;
    display: flex;
    position: relative;
    transition: background 300ms ease-in-out;
    border-radius: 10px;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    &__img-container {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 12px;
      border: 1px solid @grayPrimary;

      img {
        width: 60px;
        height: 60px;
        margin-top: -10px;
        margin-left: -10px;
      }
    }

    h5 {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 44px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      margin: 0;
    }

    svg {
      position: absolute;
      right: 12px;
      top: 50%;
      margin-top: -12px;
    }
  }
}
</style>
