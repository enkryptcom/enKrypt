<template>
  <app-dialog v-model="model" width="360px" is-centered @close:dialog="close">
    <div class="asset-detail-view__wrap">
      <div class="asset-detail-view__token-info">
        <img :src="token.icon" />

        <div class="asset-detail-view__token-info-name">
          <h4 v-if="token.name.length <= 16">{{ token.name }}</h4>
          <tooltip v-else :text="token.name"
            ><h4>{{ `${token.name.slice(0, 12)}...` }}</h4></tooltip
          >
          <p>{{ token.symbol.toLowerCase() }}</p>
        </div>
      </div>

      <div
        v-if="token.priceChangePercentage !== 0"
        class="asset-detail-view__token-sparkline"
      >
        <v-chart class="chart-large" :option="option" />

        <div
          v-if="token.priceChangePercentage !== 0"
          class="asset-detail-view__token-sparkline-price"
        >
          <h4>{{ $filters.parseCurrency(token.valuef) }}</h4>
          <p
            :class="{
              down: token.priceChangePercentage < 0,
              up: token.priceChangePercentage >= 0,
            }"
          >
            <sparkline-up v-if="token.priceChangePercentage >= 0" />
            <sparkline-down v-if="token.priceChangePercentage < 0" />

            {{ token.priceChangePercentage.toFixed(2) }}%
            <span class="asset-detail-view__last-24">Last 24h</span>
          </p>
        </div>
      </div>

      <div class="asset-detail-view__token-divider" />

      <div class="asset-detail-view__token-balance" v-if="!isCustomToken">
        <h6>Balance</h6>
        <h4>
          {{ token.balancef }} <span>{{ token.symbol.toLowerCase() }}</span>
        </h4>
        <p>{{ $filters.parseCurrency(token.balanceUSDf) }}</p>
      </div>
      <asset-detail-action
        @open:buy-action="openBuySell"
        :token="token"
        v-if="!isCustomToken"
      />
      <div class="asset-detail-view__token-divider" v-if="isCustomToken" />
      <div class="asset-detail-view__action" v-if="isCustomToken">
        <base-button
          title="Delete custom token"
          :red="true"
          :click="removeToken"
        />
        <span class="label"
          >*Deleting custom token deletes it for the whole network.</span
        >
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
  width: 128,
  height: 128,
  color: [props.token.priceChangePercentage >= 0 ? '#80FFA5' : '#e01f43'],
  grid: { show: false, left: 0, top: 0 },
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
        width: 3,
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
.chart-large {
  height: 128px;
  width: 128px;
}
.asset-detail-view {
  width: 100%;
  height: auto;
  box-sizing: border-box;

  &__last-24 {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0.5px;
    color: @grayPrimary;
  }

  &__wrap {
    padding: 24px;
  }

  &__token {
    &-info {
      display: flex;
      box-sizing: border-box;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;

      img {
        width: 48px;
        height: 48px;
        box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
        border-radius: 100%;
        margin-right: 16px;
        object-fit: contain;
      }

      &-name {
        h4 {
          font-style: normal;
          font-weight: 500;
          font-size: 16px;
          line-height: 24px;
          text-align: center;
          color: @primaryLabel;
          margin: 0;
        }

        p {
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0.5px;
          color: @secondaryLabel;
          margin: 0;
          text-transform: uppercase;
        }
      }
    }
    &-sparkline {
      display: flex;
      box-sizing: border-box;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      margin-top: 16px;

      img {
        width: 48px;
        margin-right: 16px;
      }

      &-price {
        padding-left: 50px;
        h4 {
          font-style: normal;
          font-weight: 700;
          font-size: 16px;
          line-height: 24px;
          text-align: center;
          color: @primaryLabel;
          margin: 0;
        }
        p {
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0.5px;
          margin: 0;
        }
      }
    }
    &-divider {
      margin: 24px 0 24px -24px;
      height: 1px;
      width: calc(~'100% + 48px');
      background: @gray02;
    }
    &-balance {
      margin: 0 0 16px 0;

      h6 {
        font-style: normal;
        font-weight: 700;
        font-size: 16px;
        line-height: 20px;
        letter-spacing: 0.15px;
        color: @primaryLabel;
        margin: 0;
      }
      h4 {
        font-style: normal;
        font-weight: 700;
        font-size: 24px;
        line-height: 32px;
        color: @primaryLabel;
        margin: 0;

        span {
          font-variant: small-caps;
        }
      }
      p {
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
        margin: 0;
        color: @secondaryLabel;
      }
    }
  }
  &__action {
    margin: 0 0 -12px -12px;
    width: calc(~'100% + 24px');
    text-align: center;

    .label {
      color: @secondaryLabel;
    }
  }
}
</style>
