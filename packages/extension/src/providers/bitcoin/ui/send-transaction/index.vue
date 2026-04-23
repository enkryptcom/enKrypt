<template>
  <div class="container">
    <div v-if="isLoadingAssets" class="send-transaction__loading">
      <div class="send-transaction__loading-content">
        <div class="send-transaction__loading-spinner"></div>
        <p class="send-transaction__loading-text">Loading...</p>
      </div>
    </div>

    <div v-if="!!selected && !isLoadingAssets" class="send-transaction">
      <send-header
        :is-send-token="isSendToken"
        :is-nft-available="!!network.NFTHandler"
        @close="close"
        @toggle-type="toggleSelector"
      />

      <div
        v-if="!!accountInfo.sparkAccount && network.name === NetworkNames.Firo"
        class="send-transaction__tabs"
      >
        <button
          :class="
            selectedSendTab === 'transparent' && 'send-transaction__tabs-active'
          "
          @click="setSelectedSendTab('transparent')"
        >
          Transparent address
        </button>
        <button
          :class="
            selectedSendTab === 'spark' && 'send-transaction__tabs-active'
          "
          @click="setSelectedSendTab('spark')"
        >
          Spark address
        </button>
      </div>

      <transparent-send-tab
        v-show="selectedSendTab === 'transparent'"
        :network="network"
        :account-info="accountInfo"
        :is-send-token="isSendToken"
        v-model:isLoadingAssets="isLoadingAssets"
        :updateIsLoadingAssets="updateIsLoadingAssets"
      />

      <spark-send-tab
        v-show="selectedSendTab === 'spark'"
        v-if="!!accountInfo.sparkAccount"
        :network="network"
        :account-info="accountInfo"
        :spark-account="accountInfo?.sparkAccount ?? null"
        :is-send-token="isSendToken"
        v-model:isLoadingAssets="isLoadingAssets"
        :updateIsLoadingAssets="updateIsLoadingAssets"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { trackSendEvents } from '@/libs/metrics';
import { SendEventType } from '@/libs/metrics/types';
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import SendHeader from '@/providers/common/ui/send-transaction/send-header.vue';
import { AccountsHeaderData } from '@action/types/account';
import { NetworkNames } from '@enkryptcom/types';
import { PropType, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SparkSendTab from './tabs/spark-send-tab.vue';
import TransparentSendTab from './tabs/transparent-send-tab.vue';

const props = defineProps({
  network: {
    type: Object as PropType<BitcoinNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

const route = useRoute();
const router = useRouter();
const selected: string = route.params.id as string;
const isSendToken = ref<boolean>(JSON.parse(route.params.isToken as string));
const selectedSendTab = ref<'transparent' | 'spark'>('transparent');
const isLoadingAssets = ref(false);

const close = () => {
  trackSendEvents(SendEventType.SendDecline, {
    network: props.network.name,
  });
  router.go(-1);
};

console.log({ isLoadingAssets: isLoadingAssets.value });

const updateIsLoadingAssets = (value = false) => {
  isLoadingAssets.value = value;
};

const setSelectedSendTab = (activeTab: 'transparent' | 'spark') => {
  selectedSendTab.value = activeTab;
};

const toggleSelector = (isTokenSend: boolean) => {
  isSendToken.value = isTokenSend;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';
@import '@action/styles/custom-scroll.less';

.container {
  width: 100%;
  height: 600px;
  margin: 0;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    pointer-events: none;
    z-index: 0;
  }
}

.send-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-bottom: 88px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;
  animation: fadeInUp 300ms ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  &__tabs {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 12px;
    margin-top: 16px;

    &-active {
      border-color: @primaryLabel !important;
    }

    button {
      outline: none;
      border: 1px solid @buttonBg;
      padding: 4px 8px;
      box-sizing: border-box;
      display: block;
      background: @buttonBg;
      border-radius: 6px;
      text-decoration: none;
      font-style: normal;
      font-weight: 500;
      font-size: 11px;
      line-height: 16px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: @primaryLabel;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      cursor: pointer;
      transition: opacity 300ms ease-in-out;

      &:hover {
        border-color: @primaryLabel;
      }
    }
  }

  &__loading {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    &-spinner {
      width: 48px;
      height: 48px;
      border: 3px solid rgba(98, 126, 234, 0.15);
      border-top-color: #627eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    &-text {
      font-size: 15px;
      font-weight: 500;
      color: @secondaryLabel;
      margin: 0;
      letter-spacing: 0.1px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  }

  // Staggered animation for child elements
  & > *:nth-child(1) {
    animation-delay: 0ms;
  }
  & > *:nth-child(2) {
    animation-delay: 30ms;
  }
  & > *:nth-child(3) {
    animation-delay: 60ms;
  }
  & > *:nth-child(4) {
    animation-delay: 90ms;
  }
  & > *:nth-child(5) {
    animation-delay: 120ms;
  }
  & > *:nth-child(6) {
    animation-delay: 150ms;
  }
  & > *:nth-child(7) {
    animation-delay: 180ms;
  }
  & > *:nth-child(8) {
    animation-delay: 210ms;
  }

  & > * {
    animation: elementFadeIn 250ms ease-out backwards;
  }

  @keyframes elementFadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
p {
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.25px;
  color: @error;
  margin: 0;
}
</style>
