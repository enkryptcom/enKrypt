<template>
  <a :href="app.link" class="network-dapps__item">
    <img :src="app.image" />
    <p>{{ app.title }}</p>
  </a>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { DAppsItem } from "@action/types/dapps";

export default defineComponent({
  name: "NetworkDAppsItem",
  props: {
    app: {
      type: Object as PropType<DAppsItem>,
      default: () => {
        return {};
      },
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-dapps {
  font-size: 0;
  display: flex;
  flex-wrap: wrap;

  &__item {
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
