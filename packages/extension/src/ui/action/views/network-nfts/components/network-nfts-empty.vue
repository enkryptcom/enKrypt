<template>
  <div class="network-nfts__empty">
    <nft-empty></nft-empty>
    <p>Your NFTs will be shown here.</p>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkNftsEmpty",
};
</script>

<script setup lang="ts">
import NftEmpty from "@action/icons/nft/nft-empty.vue";
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-nfts {
  &__empty {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    svg {
      margin-bottom: 8px;
    }

    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @tertiaryLabel;
      margin: 0;
    }
  }
}
</style>
