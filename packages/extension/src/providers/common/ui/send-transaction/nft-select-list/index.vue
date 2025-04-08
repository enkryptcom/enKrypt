<template>
  <app-dialog v-model="model">
    <div class="nft-select-list">
      <div class="nft-select-list__header">
        <h3>Select NFT to send</h3>
      </div>

      <nft-select-list-search v-model="searchNFT" />

      <custom-scrollbar
        class="nft-select-list__scroll-area"
        :settings="scrollSettings({ suppressScrollX: true })"
      >
        <nft-select-list-item
          v-for="(item, index) in nftList"
          :key="index"
          :item="item"
          @select-nft="emit('selectNft', $event)"
        />
      </custom-scrollbar>
    </div>
  </app-dialog>
</template>

<script setup lang="ts">
import NftSelectListItem from './components/nft-select-list-item.vue';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import NftSelectListSearch from './components/nft-select-list-search.vue';
import scrollSettings from '@/libs/utils/scroll-settings';
import { computed, onMounted, PropType, ref, watch } from 'vue';
import { EvmNetwork } from '@/providers/ethereum/types/evm-network';
import {
  NFTCollection,
  NFTItem,
  NFTItemWithCollectionName,
  NFTType,
} from '@/types/nft';
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import { SolanaNetwork } from '@/providers/solana/types/sol-network';
import AppDialog from '@action/components/app-dialog/index.vue';

const model = defineModel<boolean>();
const props = defineProps({
  network: {
    type: Object as PropType<EvmNetwork | BitcoinNetwork | SolanaNetwork>,
    default: () => ({}),
  },
  address: {
    type: String,
    default: '',
  },
  selectedNft: {
    type: Object as PropType<NFTItem>,
    default: () => ({}),
  },
});

const emit = defineEmits<{
  (e: 'selectNft', data: NFTItemWithCollectionName): void;
}>();

const searchNFT = ref<string>('');

const nftCollections = ref<NFTCollection[]>([]);
const nftList = computed(() => {
  const allItems: NFTItemWithCollectionName[] = [];
  nftCollections.value.forEach(col => {
    col.items.forEach(item => {
      allItems.push({ ...item, ...{ collectionName: col.name || '' } });
    });
  });
  if (searchNFT.value && searchNFT.value !== '') {
    return allItems.filter(item => {
      return (
        item.name.toLowerCase().includes(searchNFT.value.toLowerCase()) ||
        item.collectionName
          .toLowerCase()
          .includes(searchNFT.value.toLowerCase())
      );
    });
  }
  return allItems;
});
const updateNFTList = () => {
  if (props.network.NFTHandler) {
    props.network.NFTHandler(props.network, props.address).then(collections => {
      nftCollections.value = collections;
      if (nftList.value.length) {
        for (const nft of nftList.value) {
          if (
            props.selectedNft.contract === nft.contract &&
            props.selectedNft.id === nft.id
          ) {
            emit('selectNft', nft);
            return;
          }
        }
        emit('selectNft', nftList.value[0]);
      } else
        emit('selectNft', {
          id: '',
          contract: '',
          image: '',
          name: 'No NFTs found',
          url: '',
          collectionName: '',
          type: NFTType.ERC721,
        });
    });
  }
};
watch(
  () => props.address,
  () => {
    updateNFTList();
  },
);
onMounted(() => {
  updateNFTList();
});
</script>

<style lang="less">
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

.nft-select-list {
  height: 568px;

  &__header {
    position: relative;
    padding: 14px 56px 14px 16px;

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      color: @primaryLabel;
      margin: 0;
    }
  }

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 455px;
    margin: 0 0 8px 0;
    padding: 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }

    .ps__rail-y {
      right: 4px !important;
    }
  }
}
</style>
