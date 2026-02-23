<template>
  <div class="asset-item-wrapper">
    <a class="asset-item" @click="toggleDetail()">
      <!-- Token Identity -->
      <div class="asset-item__identity">
        <div class="asset-item__icon-wrapper">
          <img :src="token.icon" alt="" />
        </div>
        <div class="asset-item__name-block">
          <h4 v-if="token.name.length <= 18" class="asset-item__name">
            {{ token.name }}
          </h4>
          <tooltip v-else :text="token.name">
            <h4 class="asset-item__name">
              {{ `${token.name.slice(0, 15)}...` }}
            </h4>
          </tooltip>
          <p class="asset-item__balance">
            {{ token.balancef }}
            <span v-if="token.symbol.length <= 6" class="asset-item__symbol">
              {{ token.symbol }}
            </span>
            <tooltip v-else :text="token.symbol">
              <span class="asset-item__symbol">{{
                `${token.symbol.slice(0, 6)}...`
              }}</span>
            </tooltip>
          </p>
        </div>
      </div>

      <!-- Price Change & Sparkline -->
      <div v-if="token.priceChangePercentage !== 0" class="asset-item__market">
        <div
          class="asset-item__change-badge"
          :class="{
            'is-negative': token.priceChangePercentage < 0,
            'is-positive': token.priceChangePercentage >= 0,
          }"
        >
          <sparkline-up v-if="token.priceChangePercentage >= 0" />
          <sparkline-down v-if="token.priceChangePercentage < 0" />
          <span>{{ Math.abs(token.priceChangePercentage).toFixed(2) }}%</span>
        </div>
        <v-chart class="asset-item__chart" :option="option" />
      </div>

      <!-- Value -->
      <div class="asset-item__value">
        <h4 class="asset-item__usd">
          {{ $filters.parseCurrency(token.balanceUSD) }}
        </h4>
        <p class="asset-item__price">
          {{ $filters.parseCurrency(token.value) }}
        </p>
      </div>
    </a>

    <asset-detail-view
      v-model="isDetail"
      :token="token"
      :is-custom-token="isCustomToken"
      :remove-token="removeToken"
      @open:buy-action="openBuySell"
    />
  </div>
</template>

<script setup lang="ts">
import { PropType, ref, computed, onMounted } from 'vue';
import { CustomErc20Token } from '@/libs/tokens-state/types';
import { BaseNetwork } from '@/types/base-network';
import SparklineUp from '@action/icons/asset/sparkline-up.vue';
import SparklineDown from '@action/icons/asset/sparkline-down.vue';
import AssetDetailView from '@action/views/asset-detail-view/index.vue';
import { AssetsType } from '@/types/provider';
import Tooltip from '@/ui/action/components/tooltip/index.vue';
import { use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent } from 'echarts/components';
import { TokensState } from '@/libs/tokens-state';
import VChart from 'vue-echarts';

const isDetail = ref(false);

const props = defineProps({
  token: {
    type: Object as PropType<AssetsType>,
    default: () => ({}),
  },
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
});
use([SVGRenderer, LineChart, TooltipComponent, GridComponent]);

const option = ref({
  width: 56,
  height: 24,
  color: [props.token.priceChangePercentage >= 0 ? '#22c55e' : '#ef4444'],
  grid: { show: false, left: 0, top: 0, right: 0, bottom: 0 },
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
        width: 1.5,
      },
      areaStyle: {
        opacity: 0.1,
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

const customTokens = ref<CustomErc20Token[]>([]);

const tokenState = new TokensState();
const fetchCustomTokens = async () => {
  try {
    return await tokenState.getTokensByNetwork(props.network.name).then(res => {
      customTokens.value = res.filter(
        (token): token is CustomErc20Token => 'address' in token,
      );
    });
  } catch {
    customTokens.value = [];
  }
};

onMounted(async () => {
  await fetchCustomTokens();
});

const isCustomToken = computed(() => {
  if (!props.token.contract) return false;
  return customTokens.value.some(
    token =>
      token.address.toLowerCase() === props.token.contract?.toLowerCase(),
  );
});

const emit = defineEmits<{
  (e: 'update:tokens'): void;
  (e: 'open:buy-action', token: AssetsType): void;
}>();

const openBuySell = () => {
  emit('open:buy-action', props.token);
};

const removeToken = () => {
  if (props.token.contract) {
    tokenState
      .removeErc20Token(props.network.name, props.token.contract)
      .then(() => {
        isDetail.value = !isDetail.value;
        emit('update:tokens');
      });
  }
};

const toggleDetail = () => {
  isDetail.value = !isDetail.value;
};
</script>

<style lang="less">
@import '@action/styles/theme.less';

.asset-item-wrapper {
  padding: 0 12px;
}

.asset-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(117, 89, 209, 0.04) 0%,
      rgba(117, 89, 209, 0.02) 100%
    );
  }

  &:active {
    transform: scale(0.995);
  }

  // Token Identity Section
  &__identity {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  &__icon-wrapper {
    position: relative;
    width: 40px;
    height: 40px;
    flex-shrink: 0;

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: contain;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      background: @white;
    }
  }

  &__name-block {
    min-width: 0;
    flex: 1;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: @primaryLabel;
    margin: 0 0 2px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }

  &__balance {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 400;
    color: @secondaryLabel;
    margin: 0;
    white-space: nowrap;
  }

  &__symbol {
    text-transform: uppercase;
    font-weight: 500;
    color: @tertiaryLabel;
    font-size: 12px;
  }

  // Market Data Section
  &__market {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin: 0 8px;
    min-width: 64px;
  }

  &__change-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;

    &.is-positive {
      background: rgba(34, 197, 94, 0.1);
      color: #16a34a;

      svg {
        width: 10px;
        height: 10px;
      }
    }

    &.is-negative {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;

      svg {
        width: 10px;
        height: 10px;
      }
    }
  }

  &__chart {
    height: 24px;
    width: 56px;
  }

  // Value Section
  &__value {
    text-align: right;
    min-width: 90px;
    flex-shrink: 0;
  }

  &__usd {
    font-size: 15px;
    font-weight: 600;
    color: @primaryLabel;
    margin: 0 0 2px 0;
    line-height: 1.3;
  }

  &__price {
    font-size: 12px;
    font-weight: 400;
    color: @tertiaryLabel;
    margin: 0;

    &::before {
      content: '@';
      opacity: 0.7;
    }
  }
}

// Legacy class overrides for compatibility
.chart {
  height: 24px;
  width: 56px;
}

.down {
  color: @error;
}

.up {
  color: @success;
}
</style>
