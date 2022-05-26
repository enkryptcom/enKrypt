<template>
  <div class="container">
    <custom-scrollbar
      v-if="!!NFTs"
      class="network-nfts__scroll-area"
      :settings="settings"
    >
      <div v-if="!!selected" class="network-nfts">
        <!-- <network-nfts-total :amount="totalValue" /> -->
        <network-nfts-favorite :favorites="favorites"></network-nfts-favorite>
        <network-nfts-category
          v-for="(item, index) in NFTs"
          :key="index"
          :collection="item"
        ></network-nfts-category>
        <network-nfts-hidden :hiddens="hiddens"></network-nfts-hidden>
      </div>
    </custom-scrollbar>

    <network-nfts-empty
      v-if="!NFTs && !favorites && !hiddens"
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
// import NetworkNftsTotal from "./components/network-nfts-total.vue";
import NetworkNftsCategory from "./components/network-nfts-category.vue";
import NetworkNftsFavorite from "./components/network-nfts-favorite.vue";
import NetworkNftsHidden from "./components/network-nfts-hidden.vue";
import NetworkNftsEmpty from "./components/network-nfts-empty.vue";
import { onMounted, PropType, ref, watch } from "vue";
import { NodeType } from "@/types/provider";
import { AccountsHeaderData } from "../../types/account";
import { NFTCollection } from "@/types/nft";
import BigNumber from "bignumber.js";
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
const totalValue = ref("0");
const NFTs = ref<NFTCollection[] | null>(null);
const favorites = [
  {
    collection: "ETHEREUM:0xef9e3414339a236cbfc8bf84c7fac24c2513b317",
    contract: "0xef9e3414339a236cbfc8bf84c7fac24c2513b317",
    id: "7411",
    image:
      "https://ipfs.infura.io/ipfs/QmfUaffettmFaX7G4J7NUQzfXcnKG1BAvKrWnWoureHz14/7411.png",
    name: "Eyes of Fashion #7411",
    valueUSD: "0",
  },
];
const hiddens = [
  {
    collection: "ETHEREUM:0xef9e3414339a236cbfc8bf84c7fac24c2513b317",
    contract: "0xef9e3414339a236cbfc8bf84c7fac24c2513b317",
    id: "7411",
    image:
      "https://ipfs.infura.io/ipfs/QmfUaffettmFaX7G4J7NUQzfXcnKG1BAvKrWnWoureHz14/7411.png",
    name: "Eyes of Fashion #7411",
    valueUSD: "0",
  },
];
watch([props.accountInfo, props.network], () => {
  updateNFTInfo();
});
onMounted(() => {
  updateNFTInfo();
});
const updateNFTInfo = () => {
  if (props.network.NFTHandler)
    props.network
      .NFTHandler(
        props.network,
        props.accountInfo.selectedAccount?.address || ""
      )
      .then((collections) => {
        NFTs.value = collections;
        let total = new BigNumber("0");
        collections.forEach((col) => {
          col.items.forEach((item) => {
            total = new BigNumber(item.valueUSD).plus(total);
          });
        });
        totalValue.value = total.toFixed(2);
      });
};
const route = useRoute();

const selected: string = route.params.id as string;
const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.container {
  width: 100%;
  height: 488px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 56px 0;
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
    max-height: 487px;
    margin: 0;
    padding: 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }
}
</style>
