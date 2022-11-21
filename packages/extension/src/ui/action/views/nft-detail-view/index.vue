<template>
  <div class="nft-detail-view__container">
    <div class="nft-detail-view__overlay" @click="close()" />
    <div class="nft-detail-view__wrap">
      <a class="nft-detail-view__close" @click="close()">
        <close-icon />
      </a>

      <a
        class="nft-detail-view__favorite"
        @click="favClicked(!localIsFavorite)"
      >
        <nft-more-add-to-favorite v-if="!localIsFavorite" />
        <nft-more-delete-from-favorite v-else />
      </a>

      <notification
        v-if="isFavoriteAction"
        :hide="toggleNotification"
        :text="
          localIsFavorite ? 'Added to favorites' : 'Removed from favorites'
        "
        class="nft-detail-view__notification"
      />

      <h3>
        {{ item.name && item.name.length > 0 ? item.name : "NFT #" + item.id }}
      </h3>
      <img :src="item.image" alt="" @error="imageLoadError" />

      <div class="nft-detail-view__action">
        <action-menu :is-nft="true" :link-action="linkAction" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref } from "vue";
import CloseIcon from "@action/icons/common/close-icon.vue";
import ActionMenu from "@action/components/action-menu/index.vue";
import NftMoreAddToFavorite from "@action/icons/nft/nft-more-add-to-favorite.vue";
import NftMoreDeleteFromFavorite from "@action/icons/nft/nft-more-delete-from-favorite.vue";
import { NFTItem } from "@/types/nft";
import Notification from "@action/components/notification/index.vue";

const notfoundimg = require("@action/assets/common/not-found.jpg");
const imageLoadError = (img: any) => {
  img.target.src = notfoundimg;
};

const isFavoriteAction = ref(false);
const localIsFavorite = ref(false);
const props = defineProps({
  item: {
    type: Object as PropType<NFTItem>,
    default: () => {
      return {};
    },
  },
  linkAction: {
    type: Function as PropType<() => void>,
    default: () => ({}),
  },
  isFavorite: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});
onMounted(() => {
  localIsFavorite.value = props.isFavorite;
});
const emit = defineEmits<{
  (e: "close:popup"): void;
  (e: "update:favClicked", isFav: boolean, item: NFTItem): void;
}>();
const close = () => {
  if (localIsFavorite.value !== props.isFavorite)
    emit("update:favClicked", localIsFavorite.value, props.item);
  emit("close:popup");
};
const favClicked = (isFav: boolean) => {
  localIsFavorite.value = isFav;
  setTimeout(() => {
    toggleNotification();
  }, 100);
};
const toggleNotification = () => {
  isFavoriteAction.value = !isFavoriteAction.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.nft-detail-view {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__wrap {
    background: @white;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.039),
      0px 7px 24px rgba(0, 0, 0, 0.19);
    border-radius: 12px;
    box-sizing: border-box;
    width: 360px;
    height: auto;
    z-index: 107;
    position: relative;
    height: auto;
    overflow-x: hidden;
    padding: 24px 32px 32px 32px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      letter-spacing: 0.15px;
      color: @primaryLabel;
      margin: 0 0 16px 0;
    }

    img {
      width: 100%;
      margin: 0 0 16px 0;
      box-shadow: 0px 0.25px 1px rgba(0, 0, 0, 0.039),
        0px 0.85px 3px rgba(0, 0, 0, 0.19);
      border-radius: 12px;
    }
  }

  &__container {
    width: 800px;
    height: 600px;
    left: 0;
    top: 0px;
    position: fixed;
    z-index: 105;
    display: flex;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  &__overlay {
    background: rgba(0, 0, 0, 0.32);
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    position: absolute;
    z-index: 106;
  }

  &__close {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;
    font-size: 0;

    &:hover {
      background: @black007;
    }
  }

  &__favorite {
    position: absolute;
    top: 8px;
    right: 48px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 300ms ease-in-out;
    font-size: 0;
    padding: 8px;

    &:hover {
      background: @black007;
    }
  }

  &__action {
    margin: 0;
    width: 100%;
  }

  &__notification {
    position: absolute;
    left: 50%;
    transform: translateX(-50%) translateY(0px);
    top: 76px;
    z-index: 141;
  }
}
</style>
