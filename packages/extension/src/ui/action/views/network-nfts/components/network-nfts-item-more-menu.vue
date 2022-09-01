<template>
  <div class="network-nfts__item-more-menu">
    <!-- <a>
      <nft-more-send />
      <span>Send</span>
    </a> -->
    <a v-if="!isFavorite && !isHidden" @click="favClicked(true)">
      <nft-more-add-to-favorite />
      <span>Add to favorites</span>
    </a>
    <a v-else-if="isFavorite && !isHidden" @click="favClicked(false)">
      <nft-more-delete-from-favorite />
      <span>Remove from favorites</span>
    </a>
    <a v-if="!isHidden && !isFavorite" @click="hideClicked(true)">
      <nft-more-hide />
      <span>Hide</span>
    </a>
    <a v-else-if="isHidden && !isFavorite" @click="hideClicked(false)">
      <nft-more-show />
      <span>Show</span>
    </a>
  </div>
</template>

<script setup lang="ts">
// import NftMoreSend from "@action/icons/nft/nft-more-send.vue";
import NftMoreAddToFavorite from "@action/icons/nft/nft-more-add-to-favorite.vue";
import NftMoreDeleteFromFavorite from "@action/icons/nft/nft-more-delete-from-favorite.vue";
import NftMoreHide from "@action/icons/nft/nft-more-hide.vue";
import NftMoreShow from "@action/icons/nft/nft-more-show.vue";
import { NFTItem } from "@/types/nft";
import { PropType } from "vue";

const props = defineProps({
  send: {
    type: Function,
    default: () => {
      return null;
    },
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
  item: {
    type: Object as PropType<NFTItem>,
    required: true,
    default: () => {
      return {};
    },
  },
});
const emit = defineEmits<{
  (e: "update:favClicked", isFav: boolean, item: NFTItem): void;
  (e: "update:hideClicked", isHide: boolean, item: NFTItem): void;
  (e: "update:hideMe"): void;
}>();
const favClicked = (isFav: boolean) => {
  emit("update:favClicked", isFav, props.item);
  emit("update:hideMe");
};
const hideClicked = (isHide: boolean) => {
  emit("update:hideClicked", isHide, props.item);
  emit("update:hideMe");
};
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
    padding: 8px;
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
      transition: background 300ms ease-in-out;
      border-radius: 10px;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
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
