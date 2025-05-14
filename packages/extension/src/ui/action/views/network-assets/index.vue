<template>
  <div>
    <div class="container">
      <custom-scrollbar
        class="network-assets__scroll-area"
        :settings="scrollSettings({ suppressScrollX: true })"
      >
        <div v-if="!!selected" class="network-assets">
          <network-activity-total
            :isSyncing="props.isSyncing"
            :crypto-amount="cryptoAmount"
            :fiat-amount="fiatAmount"
            :symbol="network.currencyName"
            :subnetwork="props.subnetwork"
            :network="props.network as BitcoinNetwork"
            :account-info="props.accountInfo"
            :spark-account="props.accountInfo.sparkAccount"
            @update:spark-state="updateSparkState"
          />

          <network-activity-action v-bind="$attrs" />
          <network-assets-item
            v-for="(item, index) in assets"
            :key="index"
            :token="item"
            :network="network"
            @update:tokens="updateAssets"
          ></network-assets-item>
          <div
            v-show="network.customTokens && assets.length !== 0"
            class="network-assets__add-token"
          >
            <div class="network-assets__add-token-button">
              <base-button
                title="Add custom token"
                :click="toggleShowAddCustomTokens"
                :no-background="true"
              />
            </div>
          </div>
        </div>
      </custom-scrollbar>

      <network-assets-loading v-if="isLoading"></network-assets-loading>

      <deposit
        v-if="!!props.accountInfo.selectedAccount"
        :account="props.accountInfo.selectedAccount"
        :spark-account="props.accountInfo.sparkAccount"
        :show-deposit="showDeposit"
        :network="network"
        :toggle="toggleDeposit"
      />
    </div>

    <custom-evm-token
      v-if="showAddCustomTokens"
      :address="props.accountInfo.selectedAccount?.address!"
      :network="props.network as EvmNetwork"
      @update:token-added="addCustomAsset"
      @update:close="toggleShowAddCustomTokens"
    ></custom-evm-token>
  </div>
</template>

<script setup lang="ts">
import scrollSettings from '@/libs/utils/scroll-settings';
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import { EvmNetwork } from '@/providers/ethereum/types/evm-network';
import { BaseNetwork } from '@/types/base-network';
import type { AssetsType } from '@/types/provider';
import BaseButton from '@action/components/base-button/index.vue';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import accountInfoComposable from '@action/composables/account-info';
import Deposit from '@action/views/deposit/index.vue';
import { computed, onMounted, type PropType, ref, toRef, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { AccountsHeaderData } from '../../types/account';
import NetworkActivityAction from '../network-activity/components/network-activity-action.vue';
import NetworkActivityTotal from '../network-activity/components/network-activity-total.vue';
import CustomEvmToken from './components/custom-evm-token.vue';
import NetworkAssetsItem from './components/network-assets-item.vue';
import NetworkAssetsLoading from './components/network-assets-loading.vue';

const showDeposit = ref(false);

const route = useRoute();
const props = defineProps({
  isSyncing: {
    type: Boolean,
    default: false,
  },
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  subnetwork: {
    type: String,
    default: '',
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});
const assets = ref<AssetsType[]>([]);
const isLoading = ref(false);

const emits = defineEmits<{
  (e: 'update:spark-state-changed', network: BaseNetwork): void;
}>();

const { cryptoAmount, fiatAmount } = accountInfoComposable(
  toRef(props, 'network'),
  toRef(props, 'accountInfo'),
);
const selected: string = route.params.id as string;

const updateAssets = () => {
  isLoading.value = true;
  assets.value = [];
  const currentNetwork = selectedNetworkName.value;
  props.network
    .getAllTokenInfo(props.accountInfo.selectedAccount?.address || '')
    .then(_assets => {
      if (selectedNetworkName.value !== currentNetwork) return;
      assets.value = _assets;
      isLoading.value = false;
    });
};
const updateSparkState = (network: BaseNetwork) => {
  updateAssets();
  emits('update:spark-state-changed', network);
};
const selectedAddress = computed(
  () => props.accountInfo.selectedAccount?.address || '',
);
const selectedNetworkName = computed(() => props.network.name);
const selectedSubnetwork = computed(() => props.subnetwork);
const showAddCustomTokens = ref(false);

watch([selectedAddress, selectedNetworkName, selectedSubnetwork], updateAssets);
onMounted(() => {
  updateAssets();
});

const toggleDeposit = () => {
  showDeposit.value = !showDeposit.value;
};

const toggleShowAddCustomTokens = () => {
  showAddCustomTokens.value = !showAddCustomTokens.value;
};

const addCustomAsset = (asset: AssetsType) => {
  const existingAsset = assets.value.find(a => {
    if (
      a.contract &&
      asset.contract &&
      a.contract.toLowerCase() === asset.contract.toLowerCase()
    ) {
      return true;
    }

    return false;
  });

  if (!existingAsset) {
    // refetches assets to update the custom token
    updateAssets();
  }
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

.container {
  width: 100%;
  height: 600px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  padding-top: 0;
  box-sizing: border-box;

  .deposit {
    left: 0;
  }
}

.network-assets {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    height: 100%;
    max-height: 530px;
    margin: 0;
    padding: 68px 0 68px 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }

  &__add-token {
    position: relative;
    margin: 0px 12px 0px 166px;
    z-index: 0;

    &-button {
      width: 156px;
    }
  }
}
</style>

<style lang="less">
.network-assets__scroll-area {
  .ps__rail-y {
    right: 3px !important;
    margin: 59px 0 !important;
  }
}
</style>
