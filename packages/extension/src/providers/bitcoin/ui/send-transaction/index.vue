<template>
  <div class="container">
    <div v-if="!!selected" class="send-transaction">
      <send-header
        :is-send-token="isSendToken"
        :is-nft-available="!!network.NFTHandler"
        @close="close"
        @toggle-type="toggleSelector"
      />

      <!--      "!!accountInfo.sparkAccount && network.name === NetworkNames.Firo"-->
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
        v-if="selectedSendTab === 'transparent'"
        :network="network"
        :account-info="accountInfo"
        :is-send-token="isSendToken"
      />

      <spark-send-tab
        v-if="selectedSendTab === 'spark' && !!accountInfo.sparkAccount"
        :network="network"
        :account-info="accountInfo"
        :spark-account="accountInfo?.sparkAccount ?? null"
        :is-send-token="isSendToken"
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

const close = () => {
  trackSendEvents(SendEventType.SendDecline, {
    network: props.network.name,
  });
  router.go(-1);
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
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
  position: relative;
}

.send-transaction {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  overflow: auto;

  &__tabs {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 12px;

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
      display: flex;
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
