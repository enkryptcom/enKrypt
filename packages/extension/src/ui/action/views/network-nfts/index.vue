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
        ></network-nfts-favorite>
        <network-nfts-category
          v-for="(item, index) in NFTs"
          :key="index"
          :collection="item"
          @update:fav-clicked="favClicked"
          @update:hide-clicked="hideClicked"
        ></network-nfts-category>
        <network-nfts-hidden
          v-if="hiddenNFTs.length"
          :hiddens="hiddenNFTs"
          @update:fav-clicked="favClicked"
          @update:hide-clicked="hideClicked"
        ></network-nfts-hidden>
      </div>
    </custom-scrollbar>

    <network-nfts-empty
      v-if="!NFTs.length && !favoriteNFTs.length && !hiddenNFTs.length"
    ></network-nfts-empty>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkNFTs",
};
</script>

<script setup lang="ts">
import { useRoute } from "vue-router";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import NetworkNftsCategory from "./components/network-nfts-category.vue";
import NetworkNftsFavorite from "./components/network-nfts-favorite.vue";
import NetworkNftsHidden from "./components/network-nfts-hidden.vue";
import NetworkNftsEmpty from "./components/network-nfts-empty.vue";
import { onMounted, PropType, ref, watch } from "vue";
import { NodeType } from "@/types/provider";
import { AccountsHeaderData } from "../../types/account";
import { NFTCollection, NFTItem } from "@/types/nft";
import NFTState from "@/libs/nft-state";
import scrollSettings from "@/libs/utils/scroll-settings";

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
};
const updateNFTInfo = async () => {
  if (props.network.NFTHandler) {
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
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.container {
  width: 100%;
  height: 600px;
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
    padding: 56px 0 0 0 !important;
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
