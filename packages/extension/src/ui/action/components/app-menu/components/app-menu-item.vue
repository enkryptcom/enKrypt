<template>
  <a class="app-menu__link" :class="{ active: isActive }">
    <img :src="network.image" alt="" />
    <span>{{ network.title }}</span>
  </a>
</template>

<script lang="ts">
export default {
  name: "AppMenuItem",
};
</script>

<script setup lang="ts">
import { PropType } from "vue";
import { NetworkItem } from "@action/types/network";

defineProps({
  network: {
    type: Object as PropType<NetworkItem>,
    default: () => {
      return {};
    },
  },
  isActive: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.app-menu {
  &__link {
    text-decoration: none;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    width: 100%;
    height: 40px;
    margin-bottom: 4px;
    cursor: pointer;

    &.active,
    &:hover {
      background: @black007;
      border-radius: 10px;
    }

    img {
      max-width: 24px;
      margin: 0 8px;
    }

    span {
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
    }
  }
}
</style>
