<template>
  <app-dialog v-model="model" width="360px" is-centered @close:dialog="close">
    <div class="asset-detail-view__wrap">
      <!-- Token Header -->
      <div class="asset-detail-view__header">
        <div class="asset-detail-view__token-icon">
          <img :src="token.icon" />
        </div>
        <div class="asset-detail-view__token-meta">
          <h3
            v-if="token.name.length <= 20"
            class="asset-detail-view__token-name"
          >
            {{ token.name }}
          </h3>
          <tooltip v-else :text="token.name">
            <h3 class="asset-detail-view__token-name">
              {{ `${token.name.slice(0, 17)}...` }}
            </h3>
          </tooltip>
          <span class="asset-detail-view__token-symbol">{{
            token.symbol
          }}</span>
        </div>
      </div>

      <!-- Price & Chart Section -->
      <div
        v-if="token.priceChangePercentage !== 0"
        class="asset-detail-view__chart-section"
      >
        <v-chart class="asset-detail-view__chart" :option="option" />
        <div class="asset-detail-view__price-info">
          <h4 class="asset-detail-view__current-price">
            {{ $filters.parseCurrency(token.valuef) }}
          </h4>
          <div
            class="asset-detail-view__change-badge"
            :class="{
              'is-negative': token.priceChangePercentage < 0,
              'is-positive': token.priceChangePercentage >= 0,
            }"
          >
            <sparkline-up v-if="token.priceChangePercentage >= 0" />
            <sparkline-down v-if="token.priceChangePercentage < 0" />
            <span>{{ Math.abs(token.priceChangePercentage).toFixed(2) }}%</span>
          </div>
          <span class="asset-detail-view__timeframe">24h</span>
        </div>
      </div>

      <!-- Balance Card -->
      <div class="asset-detail-view__balance-card" v-if="!isCustomToken">
        <div class="asset-detail-view__balance-header">
          <span class="asset-detail-view__balance-label">Your Balance</span>
        </div>
        <div class="asset-detail-view__balance-amount">
          <span class="asset-detail-view__balance-value">{{
            token.balancef
          }}</span>
          <span class="asset-detail-view__balance-symbol">{{
            token.symbol
          }}</span>
        </div>
        <p class="asset-detail-view__balance-usd">
          ≈ {{ $filters.parseCurrency(token.balanceUSDf) }}
        </p>
      </div>

      <!-- Actions -->
      <asset-detail-action
        @open:buy-action="openBuySell"
        :token="token"
        v-if="!isCustomToken"
      />

      <!-- Custom Token Delete -->
      <div class="asset-detail-view__custom-action" v-if="isCustomToken">
        <div class="asset-detail-view__custom-warning">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>Deleting removes this token for the entire network.</span>
        </div>
        <base-button title="Delete Token" :red="true" :click="removeToken" />
      </div>
    </div>
  </app-dialog>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue';
import BaseButton from '@action/components/base-button/index.vue';
import SparklineUp from '@action/icons/asset/sparkline-up.vue';
import SparklineDown from '@action/icons/asset/sparkline-down.vue';
import { AssetsType } from '@/types/provider';
import Tooltip from '@/ui/action/components/tooltip/index.vue';
import { use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import AppDialog from '@action/components/app-dialog/index.vue';
import AssetDetailAction from './components/asset-detail-action.vue';

const props = defineProps({
  token: {
    type: Object as PropType<AssetsType>,
    default: () => ({}),
  },
  isCustomToken: {
    type: Boolean,
    default: false,
  },
  removeToken: {
    type: Function,
    default: () => {},
  },
});
use([SVGRenderer, LineChart, TooltipComponent, GridComponent]);
const option = ref({
  width: 140,
  height: 80,
  color: [props.token.priceChangePercentage >= 0 ? '#22c55e' : '#ef4444'],
  grid: { show: false, left: 0, top: 5, right: 0, bottom: 5 },
  xAxis: [
    {
      show: false,
      type: 'category',
      showGrid: false,
      boundaryGap: false,
      splitLine: {
        show: false,
      },
    },
  ],
  yAxis: [
    {
      show: false,
      type: 'value',
      splitLine: {
        show: false,
      },
    },
  ],
  series: [
    {
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 2.5,
      },
      areaStyle: {
        opacity: 0.15,
        color: props.token.priceChangePercentage >= 0 ? '#22c55e' : '#ef4444',
      },
      showSymbol: false,
      emphasis: {
        focus: 'none',
      },
      data:
        props.token.sparkline !== '' ? JSON.parse(props.token.sparkline) : [],
    },
  ],
});

const emit = defineEmits<{
  (e: 'close:popup'): void;
  (e: 'open:buy-action', token: AssetsType): void;
}>();

const openBuySell = () => {
  emit('open:buy-action', props.token);
  emit('close:popup');
};

const close = () => {
  emit('close:popup');
};
const model = defineModel<boolean>();
</script>

<style lang="less">
@import '@action/styles/theme.less';

.asset-detail-view {
  &__wrap {
    padding: 20px;
  }

  // Token Header
  &__header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
  }

  &__token-icon {
    width: 52px;
    height: 52px;
    flex-shrink: 0;

    img {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: contain;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background: @white;
    }
  }

  &__token-meta {
    flex: 1;
    min-width: 0;
  }

  &__token-name {
    font-size: 18px;
    font-weight: 700;
    color: @primaryLabel;
    margin: 0 0 2px 0;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__token-symbol {
    font-size: 13px;
    font-weight: 500;
    color: @secondaryLabel;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  // Chart Section
  &__chart-section {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: linear-gradient(
      135deg,
      rgba(117, 89, 209, 0.04) 0%,
      rgba(117, 89, 209, 0.02) 100%
    );
    border-radius: 12px;
    margin-bottom: 16px;
  }

  &__chart {
    width: 140px;
    height: 80px;
    flex-shrink: 0;
  }

  &__price-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  &__current-price {
    font-size: 20px;
    font-weight: 700;
    color: @primaryLabel;
    margin: 0;
    line-height: 1.2;
  }

  &__change-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;

    svg {
      width: 12px;
      height: 12px;
    }

    &.is-positive {
      background: rgba(34, 197, 94, 0.12);
      color: #16a34a;
    }

    &.is-negative {
      background: rgba(239, 68, 68, 0.12);
      color: #dc2626;
    }
  }

  &__timeframe {
    font-size: 11px;
    font-weight: 500;
    color: @tertiaryLabel;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  // Balance Card
  &__balance-card {
    background: @lightBg;
    border: 1px solid @gray01;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
  }

  &__balance-header {
    margin-bottom: 8px;
  }

  &__balance-label {
    font-size: 12px;
    font-weight: 600;
    color: @secondaryLabel;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__balance-amount {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 4px;
  }

  &__balance-value {
    font-size: 28px;
    font-weight: 700;
    color: @primaryLabel;
    line-height: 1.2;
  }

  &__balance-symbol {
    font-size: 16px;
    font-weight: 600;
    color: @secondaryLabel;
    text-transform: uppercase;
  }

  &__balance-usd {
    font-size: 15px;
    font-weight: 500;
    color: @tertiaryLabel;
    margin: 0;
  }

  // Custom Token Action
  &__custom-action {
    margin-top: 8px;
  }

  &__custom-warning {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.15);
    border-radius: 10px;
    margin-bottom: 16px;

    svg {
      flex-shrink: 0;
      color: #d97706;
      margin-top: 1px;
    }

    span {
      font-size: 13px;
      color: @secondaryLabel;
      line-height: 1.4;
    }
  }
}

// Legacy compatibility
.chart-large {
  height: 80px;
  width: 140px;
}

.down {
  color: @error;
}

.up {
  color: @success;
}
</style>
