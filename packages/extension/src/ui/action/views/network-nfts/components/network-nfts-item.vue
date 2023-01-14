<template>
  <div class="network-nfts__item">
    <a class="network-nfts__item-image" @click="toggleDetail">
      <img :src="item.image" alt="" @error="imageLoadError" />
      <div class="network-nfts__item-name">
        <div class="network-nfts__item-name-inner">
          {{ item.name }}
        </div>
      </div>
    </a>

    <a ref="toggle" class="network-nfts__item-more" @click="toggleMoreMenu">
      <span></span><span></span><span></span>
    </a>

    <network-nfts-item-more-menu
      v-if="isOpenMore"
      ref="dropdown"
      :is-favorite="isFavorite"
      :is-hidden="isHidden"
      :item="item"
      v-bind="$attrs"
      @update:hide-me="toggleMoreMenu"
    />

    <nft-detail-view
      v-if="isDetail"
      :item="item"
      :is-favorite="isFavorite"
      :link-action="openLink"
      v-bind="$attrs"
      @close:popup="toggleDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NFTItem } from "@/types/nft";
import { PropType } from "vue";
import NetworkNftsItemMoreMenu from "./network-nfts-item-more-menu.vue";
import NftDetailView from "@action/views/nft-detail-view/index.vue";
import { onClickOutside } from "@vueuse/core";
import DomainState from "@/libs/domain-state";
import { NetworkNames } from "@enkryptcom/types";

const domainState = new DomainState();
const notfoundimg = require("@action/assets/common/not-found.jpg");
const imageLoadError = (img: any) => {
  img.target.src = notfoundimg;
};
const isOpenMore = ref(false);
const isDetail = ref(false);
const dropdown = ref(null);
const toggle = ref(null);

const props = defineProps({
  item: {
    type: Object as PropType<NFTItem>,
    default: () => {
      return {};
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
const toggleMoreMenu = () => {
  isOpenMore.value = !isOpenMore.value;
};
const toggleDetail = () => {
  isDetail.value = !isDetail.value;
};
const openLink = async () => {
  const selectedNetwork =
    (await domainState.getSelectedNetWork()) as NetworkNames;

  let url: string | null = null;

  if (selectedNetwork === NetworkNames.Optimism) {
    url = `https://qx.app/asset/${props.item.contract}/${props.item.id}`;
  } else {
    url = props.item.url;
  }

  if (url) {
    window.open(url, "_blank");
  }
};
onClickOutside(
  dropdown,
  () => {
    if (isOpenMore.value) isOpenMore.value = false;
  },
  { ignore: [toggle] }
);
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-nfts {
  &__item {
    margin-bottom: 8px;
    width: 128px;
    margin-right: 18px;
    position: relative;

    &:nth-child(3n) {
      margin-right: 0;
    }

    &-image {
      border-radius: 12px;
      width: 128px;
      height: 128px;
      background: @buttonBg;
      box-shadow: 0px 0.25px 1px rgba(0, 0, 0, 0.039),
        0px 0.85px 3px rgba(0, 0, 0, 0.19);
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      display: block;
      text-decoration: none;
      cursor: pointer;

      img {
        max-width: 140%;
        max-height: 140%;
        position: absolute;
        top: 50%;
        left: 50%;
        -ms-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
      }
    }

    &-name {
      width: 128px;
      min-height: 28px;
      max-height: 48px;
      left: 0px;
      bottom: 0px;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.3) 100%
      );
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @white;
      position: absolute;
      box-sizing: border-box;
      -webkit-transition: all 0.3s ease-in-out;
      -moz-transition: all 0.3s ease-in-out;
      -ms-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      opacity: 0;
      -ms-line-clamp: 2;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &-more {
      position: absolute;
      width: 20px;
      height: 20px;
      right: 6px;
      top: 6px;
      border-radius: 100%;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: row;
      -webkit-transition: all 0.3s ease-in-out;
      -moz-transition: all 0.3s ease-in-out;
      -ms-transition: all 0.3s ease-in-out;
      -o-transition: all 0.3s ease-in-out;
      transition: all 0.3s ease-in-out;
      opacity: 0;

      span {
        display: block;
        width: 3px;
        height: 3px;
        background-color: @primaryLabel;
        border-radius: 3px;
        margin: 1px;
      }
    }

    &:nth-child(3n - 2) {
      .network-nfts__item-more-menu {
        left: 85px;
        right: none;
      }
    }

    &:hover {
      .network-nfts__item-name,
      .network-nfts__item-more {
        opacity: 1;
      }
    }
  }
}
.network-nfts__item-name-inner {
  margin: 4px 8px;
  overflow: hidden;
  max-height: 48px;
  height: 100%;
  -ms-line-clamp: 2;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
}
</style>
