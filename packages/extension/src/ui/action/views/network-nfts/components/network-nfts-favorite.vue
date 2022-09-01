<template>
  <div class="network-nfts__favorite">
    <a class="network-nfts__favorite-head" @click="toggle">
      <p>Favorites</p>
      <switch-arrow class="network-nfts__favorite-arrow" />
    </a>
    <div v-show="isOpen" class="network-nfts__favorite-items">
      <network-nfts-item
        v-for="(item, index) in favorites"
        :key="index"
        :item="item"
        :is-favorite="true"
        v-bind="$attrs"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import NetworkNftsItem from "./network-nfts-item.vue";
import SwitchArrow from "@action/icons/header/switch_arrow.vue";
import { NFTItem } from "@/types/nft";
const isOpen = ref(true);

defineProps({
  favorites: {
    type: Object as PropType<NFTItem[]>,
    default: () => {
      return {};
    },
  },
});

const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-nfts {
  &__favorite {
    padding-top: 10px;
    position: relative;

    &-head {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      position: relative;
      cursor: pointer;
      text-decoration: none;

      p {
        font-style: normal;
        font-weight: 700;
        font-size: 20px;
        line-height: 28px;
        color: @primaryLabel;
        margin: 0;
      }
    }

    &-arrow {
      position: absolute;
      top: 50%;
      right: 8px;
      margin-top: -12px;
      cursor: pointer;
    }

    &-items {
      padding-top: 10px;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
}
</style>
