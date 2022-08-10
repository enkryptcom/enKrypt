<template>
  <div class="network-nfts__category">
    <div class="network-nfts__category-head">
      <!-- <img :src="collection.image" alt="" /> -->
      <p>{{ collection.name }}</p>

      <a class="network-nfts__category-sort" @mouseenter="toggleSortMenu">
        <nft-sort-menu ref="dropdown"></nft-sort-menu>
      </a>
    </div>
    <div class="network-nfts__category-items">
      <network-nfts-item
        v-for="(item, index) in reactiveCollection.items"
        :key="index"
        :item="item"
        v-bind="$attrs"
      ></network-nfts-item>
    </div>

    <network-nfts-category-sort-menu
      v-show="isOpenSort"
      :is-abc-sort="isAbcSort"
      :abc-sort="abcSortAction"
      @mouseleave="toggleSortMenu"
    ></network-nfts-category-sort-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, ref } from "vue";
import NetworkNftsItem from "./network-nfts-item.vue";
import NftSortMenu from "@action/icons/nft/nft-sort-menu.vue";
import NetworkNftsCategorySortMenu from "./network-nfts-category-sort-menu.vue";
import { NFTCollection } from "@/types/nft";
import { onClickOutside } from "@vueuse/core";

let isOpenSort = ref(false);
let isAbcSort = ref(true);
const dropdown = ref(null);

const props = defineProps({
  collection: {
    type: Object as PropType<NFTCollection>,
    default: () => {
      return {};
    },
  },
});
const reactiveCollection = computed<NFTCollection>(() => {
  const collectionCopy = JSON.parse(
    JSON.stringify(props.collection)
  ) as NFTCollection;
  if (isAbcSort.value)
    collectionCopy.items.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );
  return collectionCopy;
});
const toggleSortMenu = () => {
  isOpenSort.value = !isOpenSort.value;
};
const abcSortAction = (isAbc: boolean) => {
  isAbcSort.value = isAbc;
};
onClickOutside(dropdown, () => {
  if (isOpenSort.value) isOpenSort.value = false;
});
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
