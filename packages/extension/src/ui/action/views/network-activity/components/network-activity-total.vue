<template>
  <div
    v-if="cryptoAmount == '~' && !assumedError"
    class="network-activity__total"
  >
    <div>
      <balance-loader class="network-activity__loader-one" />
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
      <p>
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
</template>

<script setup lang="ts">
import BalanceLoader from '@action/icons/common/balance-loader.vue';
import { onBeforeMount, ref, watchEffect, computed } from 'vue';
import { use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import VChart from 'vue-echarts';

use([SVGRenderer, LineChart, GridComponent]);

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
});

let timer: NodeJS.Timeout | null = null;
const assumedError = ref(false);

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

.network-activity {
  &__total-error {
    padding: 16px 24px;
    margin: 0 24px 16px 24px;
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
    margin: 0 24px 16px 24px;
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
