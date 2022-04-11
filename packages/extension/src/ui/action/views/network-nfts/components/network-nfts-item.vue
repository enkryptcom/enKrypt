<template>
  <div class="network-nfts__item">
    <img :src="item.image" alt="" />
    <h4>{{ item.name }}</h4>
    <p>{{ item.price }} <span>eth</span></p>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkNftsItem",
};
</script>

<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { NFTItem } from "@action/types/nft";

defineProps({
  item: {
    type: Object as PropType<NFTItem>,
    default: () => {
      return {};
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-nfts {
  &__item {
    margin-bottom: 8px;
    
    img {
      border-radius: 12px;
      max-width: 128px;
    }

    h4 {
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @primaryLabel;
      margin: 8px 0 0 0;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @secondaryLabel;
      margin: 0;

      span {
        font-variant: small-caps;
      } 
    }
  }
}
</style>
