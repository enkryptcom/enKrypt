<template>
  <div class="network-nfts__item">
    <img :src="item.image" alt="" @error="imageLoadError" />
    <h4>{{ item.name }}</h4>
    <p>{{ $filters.currencyFormat(item.valueUSD, "USD") }} <span>USD</span></p>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkNftsItem",
};
</script>

<script setup lang="ts">
import { NFTItem } from "@/types/nft";
import { PropType } from "vue";
const notfoundimg = require("@action/assets/common/not-found.jpg");
const imageLoadError = (img: any) => {
  img.target.src = notfoundimg;
};
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
    width: 128px;
    margin-right: 18px;

    &:nth-child(3n) {
      margin-right: 0;
    }

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
      word-break: break-all;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @secondaryLabel;
      margin: 0;
      word-break: break-all;

      span {
        font-variant: small-caps;
      }
    }
  }
}
</style>
