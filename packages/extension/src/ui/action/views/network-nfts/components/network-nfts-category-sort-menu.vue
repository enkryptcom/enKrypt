<template>
  <div class="network-nfts-category__sort-menu">
    <a @click="abcSort(true)">
      <span>Collections: A — Z</span>
      <done-icon v-if="isAbcSort" />
    </a>
    <a @click="abcSort(false)">
      <span>Recently added</span>
      <done-icon v-if="!isAbcSort" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import DoneIcon from "@action/icons/common/done_icon.vue";

defineProps({
  abcSort: {
    type: Function as PropType<(isAbc: boolean) => void>,
    default: () => {
      return null;
    },
  },
  isAbcSort: {
    type: Boolean,
    default: () => {
      return true;
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-nfts-category {
  &__sort-menu {
    position: absolute;
    width: 220px;
    top: 36px;
    right: -8px;
    background: @white;
    box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
      0px 3.75px 11px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    z-index: 1;
    padding: 8px;
    box-sizing: border-box;

    a {
      height: 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: row;
      text-decoration: none;
      padding: 0 16px;
      box-sizing: border-box;
      cursor: pointer;
      transition: background 300ms ease-in-out;
      border-radius: 10px;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      svg {
        margin-right: 0;
      }

      span {
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
