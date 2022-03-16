<template>
  <a class="app-menu__link" :class="{ active: isActive }">
    <img :src="network.image" alt="" />
    <span>{{ network.title }}</span>
  </a>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { NetworkItem } from "@popup/types/network";

export default defineComponent({
  name: "AppMenuItem",
  props: {
    network: {
      type: Object as PropType<NetworkItem>,
      default: () => {
        return {};
      },
    },
    isActive: Boolean,
  },
});
</script>

<style lang="less">
@import "~@popup/styles/theme.less";

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
