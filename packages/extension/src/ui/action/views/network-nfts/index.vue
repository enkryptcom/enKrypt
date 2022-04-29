<template>
  <div class="container">
    <custom-scrollbar class="network-nfts__scroll-area" :settings="settings">
      <div v-if="!!selected" class="network-nfts">
        <network-nfts-total :amount="totalValue" />

        <network-nfts-category
          v-for="(item, index) in NFTs"
          :key="index"
          :collection="item"
        ></network-nfts-category>
      </div>
    </custom-scrollbar>
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
import NetworkNftsTotal from "./components/network-nfts-total.vue";
import NetworkNftsCategory from "./components/network-nfts-category.vue";
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
  padding-top: 14px;
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
    max-height: 460px;
    margin: 0 0 8px 0;
    padding: 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }
}
</style>
