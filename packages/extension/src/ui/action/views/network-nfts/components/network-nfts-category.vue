<template>
  <div class="network-nfts__category">
    <div class="network-nfts__category-head">
      <img :src="collection.image" alt="" />
      <p>{{ collection.name }}</p>
    </div>
    <div class="network-nfts__category-items">
      <network-nfts-item
        v-for="(item, index) in collection.items"
        :key="index"
        :item="item"
      ></network-nfts-item>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkNftsCategory",
};
</script>

<script setup lang="ts">
import { PropType } from "vue";
import NetworkNftsItem from "./network-nfts-item.vue";
import { NFTCollection } from "@/types/nft";

defineProps({
  collection: {
    type: Object as PropType<NFTCollection>,
    default: () => {
      return {};
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-nfts {
  &__category {
    padding-top: 8px;

    &-head {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;

      img {
        max-width: 24px;
        margin-right: 16px;
        border-radius: 100%;
        box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
      }

      p {
        font-style: normal;
        font-weight: 700;
        font-size: 16px;
        line-height: 24px;
        color: @primaryLabel;
        margin: 0;
      }
    }

    &-items {
      padding-top: 8px;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      flex-direction: row;
    }
  }
}
</style>
