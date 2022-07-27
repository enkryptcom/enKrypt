<template>
  <a class="network-dapps__item" @click="openLink">
    <img :src="app.image" />
    <p>{{ app.title }}</p>
  </a>
</template>

<script setup lang="ts">
import { DAppsItem } from "@/types/ui";
import { PropType } from "vue";

const props = defineProps({
  app: {
    type: Object as PropType<DAppsItem>,
    default: () => {
      return {};
    },
  },
});
const openLink = () => {
  window.open(props.app.link, "_blank", "noopener");
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-dapps {
  font-size: 0;
  display: flex;
  flex-wrap: wrap;

  &__item {
    cursor: pointer;
    height: 72px;
    padding: 12px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    width: calc(~"50% - 8px");
    height: 56px;
    background: @buttonBg;
    border-radius: 12px;
    margin-bottom: 16px;
    text-decoration: none;
    margin-right: 8px;

    &:nth-child(even) {
      margin-right: 0;
      margin-left: 8px;
    }

    img {
      width: 32px;
      margin-right: 11px;
    }

    p {
      font-style: normal;
      font-weight: 600;
      font-size: 15px;
      line-height: 20px;
      display: flex;
      align-items: center;
      letter-spacing: -0.24px;
      font-feature-settings: "ss15" on;
      color: @primaryLabel;
      margin: 0;
    }
  }
}
</style>
