<template>
  <div v-if="!!selected" class="container">
    <custom-scrollbar
      v-if="!!NFTs"
      class="network-nfts__scroll-area"
      :settings="scrollSettings({ suppressScrollX: true })"
    >
      <div class="network-nfts">
        <network-nfts-favorite
          v-if="favoriteNFTs.length"
          :favorites="favoriteNFTs"
          @update:fav-clicked="favClicked"
          @update:hide-clicked="hideClicked"
          @update:toggle-detail="toggleDetail"
        />
        <network-nfts-category
          v-for="(item, index) in NFTs"
          :key="index"
          :collection="item"
          @update:fav-clicked="favClicked"
          @update:hide-clicked="hideClicked"
          @update:toggle-detail="toggleDetail"
        />
        <network-nfts-hidden
          v-if="hiddenNFTs.length"
          :hiddens="hiddenNFTs"
          @update:fav-clicked="favClicked"
          @update:hide-clicked="hideClicked"
          @update:toggle-detail="toggleDetail"
        />
      </div>
    </custom-scrollbar>

    <network-nfts-empty
      v-if="!NFTs.length && !favoriteNFTs.length && !hiddenNFTs.length"
      :is-empty="isNoNFTs"
    />

    <nft-detail-view
      v-if="!!detailNFT"
      :item="detailNFT"
      :is-favorite="isFavorite"
      :link-action="openLink"
      v-bind="$attrs"
      @close:popup="toggleDetail(null)"
      @update:fav-clicked="favClicked"
      @update:hide-clicked="hideClicked"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import NetworkNftsCategory from "./components/network-nfts-category.vue";
import NetworkNftsFavorite from "./components/network-nfts-favorite.vue";
import NetworkNftsHidden from "./components/network-nfts-hidden.vue";
import NetworkNftsEmpty from "./components/network-nfts-empty.vue";
import { onMounted, PropType, ref, watch, computed } from "vue";
import { NodeType } from "@/types/provider";
import { AccountsHeaderData } from "../../types/account";
import { NFTCollection, NFTItem } from "@/types/nft";
import NFTState from "@/libs/nft-state";
import scrollSettings from "@/libs/utils/scroll-settings";
import NftDetailView from "@action/views/nft-detail-view/index.vue";

const nftState = new NFTState();
const props = defineProps({
  network: {
    type: Object as PropType<NodeType>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});
const NFTs = ref<NFTCollection[]>([]);
const favoriteNFTs = ref<NFTItem[]>([]);
const hiddenNFTs = ref<NFTItem[]>([]);
const liveNFTCollection = ref<NFTCollection[]>([]);
const detailNFT = ref<NFTItem | null>(null);
const isNoNFTs = ref(false);

watch([props.accountInfo, props.network], () => {
  updateNFTInfo();
});
onMounted(() => {
  updateNFTInfo();
});
const localUpdate = async () => {
  const favs = await nftState.getFavoriteNFTs();
  const hidden = await nftState.getHiddenNFTs();
  favoriteNFTs.value = [];
  hiddenNFTs.value = [];
  const collections = JSON.parse(
    JSON.stringify(liveNFTCollection.value)
  ) as NFTCollection[];
  collections.forEach((col) => {
    if (favs[col.contract]) {
      col.items.forEach((item) => {
        if (favs[col.contract].includes(item.id)) favoriteNFTs.value.push(item);
      });
      col.items = col.items.filter(
        (item) => !favs[col.contract].includes(item.id)
      );
    }
    if (hidden[col.contract]) {
      col.items.forEach((item) => {
        if (hidden[col.contract].includes(item.id)) hiddenNFTs.value.push(item);
      });
      col.items = col.items.filter(
        (item) => !hidden[col.contract].includes(item.id)
      );
    }
  });
  NFTs.value = collections.filter((col) => col.items.length);
  isNoNFTs.value = collections.length === 0;
};
const updateNFTInfo = async () => {
  liveNFTCollection.value = [];
  NFTs.value = [];
  if (props.network.NFTHandler) {
    isNoNFTs.value = false;
    props.network
      .NFTHandler(
        props.network,
        props.accountInfo.selectedAccount?.address || ""
      )
      .then((collections) => {
        liveNFTCollection.value = collections;
        localUpdate();
      });
  }
};
const route = useRoute();

const selected: string = route.params.id as string;

const favClicked = async (isFav: boolean, item: NFTItem) => {
  if (isFav) {
    await nftState.setFavoriteNFT(item.contract, item.id);
  } else {
    await nftState.deleteFavoriteNFT(item.contract, item.id);
  }
  localUpdate();
};
const hideClicked = async (isHidden: boolean, item: NFTItem) => {
  if (isHidden) {
    await nftState.setHiddenNFT(item.contract, item.id);
  } else {
    await nftState.deleteHiddenNFT(item.contract, item.id);
  }
  localUpdate();
};
const toggleDetail = (item: NFTItem | null) => {
  detailNFT.value = item;
};
const openLink = () => {
  if (detailNFT.value && detailNFT.value.url !== null) {
    window.open(detailNFT.value.url, "_blank");
  }
};
const isFavorite = computed(() => {
  if (detailNFT.value && favoriteNFTs.value.length) {
    return favoriteNFTs.value.includes(detailNFT.value);
  }

  return false;
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.container {
  width: 100%;
  height: 550px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  padding-top: 0;
  box-sizing: border-box;
}

.network-nfts {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 20px;

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 600px;
    margin: 0;
    padding: 56px 0 56px 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }
}
.network-nfts__scroll-area {
  .ps__rail-y {
    right: 3px !important;
    margin: 59px 0 !important;
  }
}
</style>
