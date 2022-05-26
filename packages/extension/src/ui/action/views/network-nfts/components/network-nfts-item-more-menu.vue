<template>
  <div class="network-nfts__item-more-menu">
    <a>
      <nft-more-send />
      <span>Send</span>
    </a>
    <a v-if="!isFavorite">
      <nft-more-add-to-favorite />
      <span>Add to favorites</span>
    </a>
    <a v-else>
      <nft-more-delete-from-favorite />
      <span>Delete from favorites</span>
    </a>
    <a v-if="!isHidden">
      <nft-more-hide />
      <span>Hide</span>
    </a>
    <a v-else>
      <nft-more-show />
      <span>Show</span>
    </a>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkNftsItemMoreMenu",
};
</script>

<script setup lang="ts">
import NftMoreSend from "@action/icons/nft/nft-more-send.vue";
import NftMoreAddToFavorite from "@action/icons/nft/nft-more-add-to-favorite.vue";
import NftMoreDeleteFromFavorite from "@action/icons/nft/nft-more-delete-from-favorite.vue";
import NftMoreHide from "@action/icons/nft/nft-more-hide.vue";
import NftMoreShow from "@action/icons/nft/nft-more-show.vue";

defineProps({
  send: {
    type: Function,
    default: () => {
      return null;
    },
  },
  isFavorite: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
  isHidden: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-nfts {
  &__item-more-menu {
    position: absolute;
    width: 220px;
    top: 36px;
    right: -8px;
    background: @white;
    box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
      0px 3.75px 11px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    z-index: 1;
    padding: 4px;
    box-sizing: border-box;

    a {
      height: 48px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      text-decoration: none;
      padding: 0 12px;
      box-sizing: border-box;
      cursor: pointer;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
        border-radius: 10px;
      }

      svg {
        margin-right: 12px;
      }

      span {
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0.25px;
        color: @primaryLabel;
      }
    }
  }
}
</style>
