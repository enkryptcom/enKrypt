<template>
  <a class="network-dapps__item" @click="openLink">
    <img :src="app.image" />
    <h4>{{ app.title }}</h4>
    <p v-if="!!app.description">{{ app.description }}</p>
    <dapps-arrow class="network-dapps__item-arrow" />
  </a>
</template>

<script setup lang="ts">
import { DAppsItem } from "@/types/ui";
import { PropType } from "vue";
import DappsArrow from "@action/icons/common/dapps-arrow.vue";

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
  &__item {
    cursor: pointer;
    padding: 12px;
    position: relative;
    box-sizing: border-box;
    width: 100%;
    background: @buttonBg;
    border-radius: 12px;
    text-decoration: none;
    box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.039),
      0px 0.5px 1.5px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    background: @white;
    transition: background 300ms ease-in-out;
    display: block;

    &:hover {
      background: @hoverItemBg;

      .network-dapps__item-arrow {
        opacity: 1 !important;
      }
    }

    img {
      width: 48px;
      height: 48px;
      border-radius: 15px;
      display: block;
      margin-bottom: 12px;
    }

    h4 {
      font-style: normal;
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: 0.15px;
      color: @primaryLabel;
      margin: 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0.5px;
      color: @secondaryLabel;
      margin: 4px 0 0 0;
    }

    &-arrow {
      opacity: 0;
      transition: opacity 300ms ease-in-out;
      position: absolute;
      right: 4px;
      top: 4px;
    }
  }
}
</style>
