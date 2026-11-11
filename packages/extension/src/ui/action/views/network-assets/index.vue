<template>
  <div>
    <div class="container">
      <custom-scrollbar
        class="network-assets__scroll-area"
        :settings="scrollSettings({ suppressScrollX: true })"
      >
        <div v-if="!!selected" class="network-assets">
          <network-activity-total
            :crypto-amount="cryptoAmount"
            :fiat-amount="fiatAmount"
            :token-price="tokenPrice"
            :price-change-percentage="priceChangePercentage"
            :sparkline="sparkline"
            :symbol="network.currencyName"
            :is-cached="isCached"
          />

          <!-- Banners -->
          <network-assets-solana-staking-banner
            v-if="isSolanaStakingBanner && selectedNetworkName == 'SOLANA'"
            @close="closeSolanaStakingBanner"
          />

          <network-activity-action v-bind="$attrs" />
          <network-assets-header v-if="!isLoading && assets.length > 0" />
          <network-assets-error
            v-if="isFetchError"
            :update-assets="updateAssets"
          />
          <!-- A row builds its chart once, so each list gets new rows -->
          <network-assets-item
            v-for="(item, index) in assets"
            :key="`${listVersion}-${index}`"
            :token="item"
            :network="network"
            @update:tokens="updateAssets"
            v-bind="$attrs"
          />
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

      <network-assets-loading v-if="isLoading" />

      <deposit
        v-if="!!selectedAccount"
        :account="selectedAccount"
        :show-deposit="showDeposit"
        @toggle:deposit="toggleDeposit"
      />
    </div>
    <!-- prettier-ignore -->
    <custom-evm-token v-if="showAddCustomTokens && isEvmNetwork" :address="selectedAccount?.address!"
      :network="(network as EvmNetwork)" @update:token-added="addCustomAsset"
      @update:close="toggleShowAddCustomTokens"></custom-evm-token>
    <!-- prettier-ignore -->
    <custom-massa-token v-if="showAddCustomTokens && isMassaNetwork" :address="selectedAccount?.address!"
      :network="network" @update:token-added="addCustomAsset"
      @update:close="toggleShowAddCustomTokens"></custom-massa-token>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import NetworkActivityTotal from '../network-activity/components/network-activity-total.vue';
import NetworkActivityAction from '../network-activity/components/network-activity-action.vue';
import NetworkAssetsItem from './components/network-assets-item.vue';
import NetworkAssetsHeader from './components/network-assets-header.vue';
import NetworkAssetsLoading from './components/network-assets-loading.vue';
import NetworkAssetsError from './components/network-assets-error.vue';
import CustomScrollbar from '@action/components/custom-scrollbar/index.vue';
import { computed, onMounted, ref } from 'vue';
import type { AssetsType } from '@/types/provider';
import accountInfoComposable from '@action/composables/account-info';
import networkAssetsComposable from '@action/composables/network-assets';
import scrollSettings from '@/libs/utils/scroll-settings';
import Deposit from '@action/views/deposit/index.vue';
import BaseButton from '@action/components/base-button/index.vue';
import CustomEvmToken from './components/custom-evm-token.vue';
import CustomMassaToken from './components/custom-massa-token.vue';
import { EvmNetwork } from '@/providers/ethereum/types/evm-network';
import { ProviderName } from '@/types/provider';
import NetworkAssetsSolanaStakingBanner from './components/network-assets-solana-staking-banner.vue';
import BannersState from '@/libs/banners-state';
import { storeToRefs } from 'pinia';
import { useNetworksStore } from '@action/store/networks-store';
import { useAccountsStore } from '@action/store/accounts-store';

const showDeposit = ref(false);

const route = useRoute();
const { currentNetwork: network } = storeToRefs(useNetworksStore());
const { selectedAccount } = storeToRefs(useAccountsStore());
const { assets, listVersion, isLoading, isFetchError, updateAssets } =
  networkAssetsComposable();

const {
  cryptoAmount,
  fiatAmount,
  tokenPrice,
  priceChangePercentage,
  sparkline,
  isCached,
} = accountInfoComposable();
const selected: string = route.params.id as string;

const selectedNetworkName = computed(() => network.value.name);
const showAddCustomTokens = ref(false);

const isSolanaStakingBanner = ref(false);
const bannersState = new BannersState();

// Network type checks
const isEvmNetwork = computed(
  () => network.value.provider === ProviderName.ethereum,
);
const isMassaNetwork = computed(
  () => network.value.provider === ProviderName.massa,
);

onMounted(async () => {
  if (await bannersState.showNetworkAssetsSolanaStakingBanner()) {
    isSolanaStakingBanner.value = true;
  }
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

const closeSolanaStakingBanner = () => {
  isSolanaStakingBanner.value = false;
  bannersState.hideNetworkAssetsSolanaStakingBanner();
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
