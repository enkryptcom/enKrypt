<template>
  <div class="network-nfts__category">
    <div class="network-nfts__category-head">
      <!-- <img :src="collection.image" alt="" /> -->
      <p>{{ collection.name }}</p>

      <a class="network-nfts__category-sort" @mouseenter="toggleSortMenu">
        <nft-sort-menu></nft-sort-menu>
      </a>
    </div>
    <div class="network-nfts__category-items">
      <network-nfts-item
        v-for="(item, index) in collection.items"
        :key="index"
        :item="item"
      ></network-nfts-item>
    </div>

    <network-nfts-category-sort-menu
      v-show="isOpenSort"
      :is-abc-sort="isAbcSort"
      :abc-sort="abcSortAction"
      :recently-sort="recentlySortAction"
      @mouseleave="toggleSortMenu"
    ></network-nfts-category-sort-menu>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkNftsCategory",
};
</script>

<script setup lang="ts">
import { PropType, ref } from "vue";
import NetworkNftsItem from "./network-nfts-item.vue";
import NftSortMenu from "@action/icons/nft/nft-sort-menu.vue";
import NetworkNftsCategorySortMenu from "./network-nfts-category-sort-menu.vue";
import { NFTCollection } from "@/types/nft";
let isOpenSort = ref(false);
let isAbcSort = ref(true);

defineProps({
  collection: {
    type: Object as PropType<NFTCollection>,
    default: () => {
      return {};
    },
  },
});

const toggleSortMenu = () => {
  isOpenSort.value = !isOpenSort.value;
};
const abcSortAction = () => {
  isAbcSort.value = true;
};
const recentlySortAction = () => {
  isAbcSort.value = false;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-nfts {
  &__category {
    padding-top: 10px;
    position: relative;

    &-head {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      position: relative;

      img {
        max-width: 24px;
        margin-right: 16px;
        border-radius: 100%;
        box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
      }

      p {
        font-style: normal;
        font-weight: 700;
        font-size: 20px;
        line-height: 28px;
        color: @primaryLabel;
        margin: 0;
      }
    }

    &-sort {
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
