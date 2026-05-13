packages/extension/src/ui/action/views/network-activity/components/network-activity-total.vue

<template>
  <div class="network-activity-total-wrapper">
    <div
      v-if="cryptoAmount == '~' && !assumedError"
      class="network-activity__total"
    >
      <div>
        <balance-loader class="network-activity__loader-one" />
        <balance-loader
          v-if="
            (isSparkBalanceFormattedPending || sparkBalanceFormatted === '-') &&
            network.name === NetworkNames.Firo
          "
          class="network-activity__loader-one"
        />

        <balance-loader class="network-activity__loader-two" />
      </div>
    </div>
    <div v-else-if="assumedError" class="network-activity__total-error">
      <h3>
        <span>Loading balance error. Please try again later</span>
      </h3>
    </div>
    <div v-else class="network-activity__total">
      <div class="network-activity__total-info">
        <h3>
          {{ cryptoAmount }} <span>{{ symbol }}</span>
        </h3>
        <h6
          v-if="
            !isSparkBalanceFormattedPending &&
            sparkBalanceFormatted !== '-' &&
            network.name === NetworkNames.Firo
          "
        >
          {{ sparkBalanceFormatted }}
          <span>Private {{ symbol }}</span>
        </h6>

        <p v-if="network.name !== NetworkNames.Firo">
          <span v-if="subnetwork !== ''">Chain {{ subnetwork }} &middot;</span>
          {{ $filters.parseCurrency(fiatAmount) }}
        </p>
      </div>

      <div v-if="tokenPrice !== '0.00'" class="network-activity__total-market">
        <div class="network-activity__total-market-header">
          <p>Price</p>
          <span
            v-if="priceChangePercentage !== 0"
            :class="{
              'network-activity__total-price-change': true,
              'is-positive': priceChangePercentage > 0,
              'is-negative': priceChangePercentage < 0,
            }"
          >
            {{ priceChangePercentage > 0 ? '+' : ''
            }}{{ priceChangePercentage.toFixed(2) }}%
          </span>
        </div>
        <h4>{{ $filters.parseCurrency(tokenPrice) }}</h4>
        <div v-if="sparkline !== ''" class="network-activity__total-chart">
          <v-chart :option="chartOption" />
        </div>
      </div>
    </div>

    <button
      v-if="sparkAccount && network.name === NetworkNames.Firo"
      class="btn__anonymize"
      @click="openAnonymizeFundsModal()"
    >
      <loader v-show="isSyncing" class="btn__anonymize__loading" />
      <span v-if="!isSyncing">Synchronized</span>
      <span v-else>Synchronizing...</span>
    </button>

    <synchronize-state
      v-if="synchronizeState && network.name === NetworkNames.Firo"
      v-model="synchronizeState"
      :isCoinSyncing="isCoinSyncing"
      :isTagSyncing="isTagSyncing"
      :network="network"
      :account-info="accountInfo"
      :spark-account="sparkAccount"
      :crypto-amount="cryptoAmount"
    />
  </div>
</template>

<script setup lang="ts">
import { BitcoinNetwork } from '@/providers/bitcoin/types/bitcoin-network';
import BalanceLoader from '@action/icons/common/balance-loader.vue';
import { use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import VChart from 'vue-echarts';
use([SVGRenderer, LineChart, GridComponent]);
import { fromBase } from '@enkryptcom/utils';
import { computed, onBeforeMount, PropType, ref, watchEffect } from 'vue';
import { AccountsHeaderData, SparkAccount } from '@action/types/account';
import { NetworkNames } from '@enkryptcom/types';
import SynchronizeState from '@action/views/network-activity/components/synchronize-state.vue';
import Loader from '@action/icons/common/loader.vue';
import useAsyncComputed from '@action/composables/async-computed';
import { calculateCurrentSparkBalance } from '@/libs/utils/updateAndSync/calculateCurrentSparkBalance';

const props = defineProps({
  cryptoAmount: {
    type: String,
    default: '0',
  },
  fiatAmount: {
    type: String,
    default: '0',
  },
  symbol: {
    type: String,
    default: '',
  },
  subnetwork: {
    type: String,
    default: '',
  },
  tokenPrice: {
    type: String,
    default: '0',
  },
  priceChangePercentage: {
    type: Number,
    default: 0,
  },
  sparkline: {
    type: String,
    default: '',
  },
  network: {
    type: Object as PropType<BitcoinNetwork>,
    default: () => ({}),
  },
  isCoinSyncing: {
    type: Boolean,
    default: false,
  },
  isTagSyncing: {
    type: Boolean,
    default: false,
  },
  sparkAccount: {
    type: Object as PropType<SparkAccount | null>,
    default: () => {
      return {};
    },
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});

let timer: NodeJS.Timeout | null = null;
const assumedError = ref(false);
const synchronizeState = ref(false);

const chartOption = computed(() => ({
  width: 90,
  height: 32,
  color: [props.priceChangePercentage >= 0 ? '#16a34a' : '#dc2626'],
  grid: { show: false, left: 0, top: 0, right: 0, bottom: 0 },
  xAxis: [
    {
      show: false,
      type: 'category',
      boundaryGap: false,
    },
  ],
  yAxis: [
    {
      show: false,
      type: 'value',
      min: 'dataMin',
      max: 'dataMax',
    },
  ],
  series: [
    {
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 1.5,
        cap: 'round',
      },
      areaStyle: {
        opacity: 0.12,
        color: props.priceChangePercentage >= 0 ? '#16a34a' : '#dc2626',
      },
      showSymbol: false,
      data: props.sparkline !== '' ? JSON.parse(props.sparkline) : [],
    },
  ],
}));

watchEffect(() => {
  if (timer) {
    clearTimeout(timer);
  }
  // set the timer on initial change to blank
  if (props.cryptoAmount == '~') {
    timer = setTimeout(() => {
      assumedError.value = true;
    }, 30000);
  }
});

onBeforeMount(() => {
  if (timer) {
    clearTimeout(timer);
  }
});

const isSyncing = computed(() => {
  return props.isCoinSyncing || props.isTagSyncing;
});

const {
  value: sparkBalanceFormatted,
  isPending: isSparkBalanceFormattedPending,
} = useAsyncComputed(async () => {
  const balance = await calculateCurrentSparkBalance();
  if (balance === '0') return '0';
  return fromBase(balance, props.network.decimals ?? 8);
}, '-');

const openAnonymizeFundsModal = () => {
  synchronizeState.value = true;
};
</script>

<style lang="less" scoped>
@import '@action/styles/theme.less';

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

.network-activity-total-wrapper {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin: 0 24px 16px 24px;
  gap: 10px;
}

.btn__anonymize {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  outline: none;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid @darkBg;
  background: @buttonBg;
  transition: all 300ms ease-in-out;

  &__loading {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: @darkBg;
    border: 1px solid @orange01;
  }

  &:disabled {
    cursor: not-allowed;
    color: @black07;
    background: @gray01;
    border: 1px solid @gray01;
  }
}

.network-activity {
  &__total-error {
    padding: 16px 24px;
    background: rgba(239, 68, 68, 0.08);
    border: 1.5px solid rgba(239, 68, 68, 0.2);
    border-radius: 16px;
    animation: fadeInUp 300ms ease-out;

    h3 {
      margin: 0;
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;

      span {
        color: #dc2626;
        font-weight: 600;
      }
    }
  }

  &__total {
    padding: 20px;
    background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1.5px solid rgba(0, 0, 0, 0.06);
    animation: fadeInUp 300ms ease-out;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(98, 126, 234, 0.03) 0%,
        rgba(138, 100, 220, 0.02) 100%
      );
      pointer-events: none;
    }

    h3 {
      font-style: normal;
      font-weight: 700;
      font-size: 26px;
      line-height: 32px;
      letter-spacing: -0.3px;
      background: linear-gradient(135deg, #627eea 0%, #8a64dc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: @primaryLabel;
      margin: 0;
      position: relative;
      z-index: 1;

      span {
        font-size: 15px;
        font-weight: 600;
        margin-left: 4px;
        background: linear-gradient(
          135deg,
          rgba(98, 126, 234, 0.65) 0%,
          rgba(138, 100, 220, 0.65) 100%
        );
        -webkit-background-clip: text;
        background-clip: text;
      }
    }

    h6 {
      font-size: 14px;
      line-height: 20px;
      color: @secondaryLabel;
      font-weight: 400;
      margin: 0;

      span {
        font-size: 14px;
      }
    }

    p {
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      color: @secondaryLabel;
      margin: 6px 0 0 0;
      position: relative;
      z-index: 1;
    }
  }

  &__total-info {
    position: relative;
    z-index: 1;
    animation: fadeInUp 300ms ease-out;
    animation-delay: 30ms;
    animation-fill-mode: both;
  }

  &__total-market {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    min-width: 110px;
    position: relative;
    z-index: 1;
    animation: fadeInUp 300ms ease-out;
    animation-delay: 60ms;
    animation-fill-mode: both;

    &-header {
      display: flex;
      align-items: center;
      gap: 8px;

      p {
        font-size: 11px;
        line-height: 14px;
        font-weight: 600;
        color: @tertiaryLabel;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0;
      }
    }

    h4 {
      font-size: 17px;
      line-height: 22px;
      font-weight: 700;
      color: @primaryLabel;
      margin: 0;
    }
  }

  &__total-price-change {
    display: inline-flex;
    align-items: center;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 10px;
    letter-spacing: 0.02em;
    transition: all 200ms ease-in-out;

    &.is-positive {
      color: #16a34a;
      background: rgba(34, 197, 94, 0.1);
    }

    &.is-negative {
      color: #dc2626;
      background: rgba(239, 68, 68, 0.08);
    }
  }

  &__total-chart {
    width: 90px;
    height: 32px;
    margin-top: 2px;
    animation: fadeInUp 300ms ease-out;
    animation-delay: 90ms;
    animation-fill-mode: both;
  }

  &__loader-one {
    width: 150px;
    height: 28px;
    margin-bottom: 12px;
    display: block !important;
    border-radius: 10px;
    animation: fadeInUp 300ms ease-out;
  }

  &__loader-two {
    width: 100px;
    height: 18px;
    display: block !important;
    border-radius: 8px;
    animation: fadeInUp 300ms ease-out;
    animation-delay: 30ms;
    animation-fill-mode: both;
  }
}
</style>
