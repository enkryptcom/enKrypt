<template>
  <a class="network-assets__token" @click="toggleDetail()">
    <div
      class="network-assets__token-info"
      :class="{ max: token.priceChangePercentage == 0 }"
    >
      <img :src="token.icon" />
      <div class="network-assets__token-info-name">
        <h4 v-if="token.name.length <= 16">{{ token.name }}</h4>
        <tooltip v-else :text="token.name"
          ><h4>{{ `${token.name.slice(0, 12)}...` }}</h4></tooltip
        >
        <p>
          {{ token.balancef }}
          <span v-if="token.symbol.length <= 6">
            {{ token.symbol.toLowerCase() }}
          </span>
          <tooltip
            v-else
            :style="{ fontSize: '12px !important' }"
            :text="token.symbol"
          >
            <span>{{ `${token.symbol.toLowerCase().slice(0, 7)}` }}</span>
          </tooltip>
        </p>
      </div>
    </div>

    <div
      v-if="token.priceChangePercentage !== 0"
      class="network-assets__token-sparkline"
      :class="{
        down: token.priceChangePercentage < 0,
        up: token.priceChangePercentage >= 0,
      }"
    >
      <p>
        <sparkline-up v-if="token.priceChangePercentage >= 0" /><sparkline-down
          v-if="token.priceChangePercentage < 0"
        />{{ token.priceChangePercentage.toFixed(2) }}%
      </p>
      <img :src="token.sparkline" />
    </div>

    <div class="network-assets__token-price">
      <h4>{{ token.balanceUSDf }}</h4>
      <p>@{{ token.valuef }}</p>
    </div>
  </a>

  <asset-detail-view
    v-if="isDetail"
    :token="token"
    @close:popup="toggleDetail"
  />
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import SparklineUp from "@action/icons/asset/sparkline-up.vue";
import SparklineDown from "@action/icons/asset/sparkline-down.vue";
import AssetDetailView from "@action/views/asset-detail-view/index.vue";
import { AssetsType } from "@/types/provider";
import Tooltip from "@/ui/action/components/tooltip/index.vue";

const isDetail = ref(false);

defineProps({
  token: {
    type: Object as PropType<AssetsType>,
    default: () => ({}),
  },
});

const toggleDetail = () => {
  isDetail.value = !isDetail.value;
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.down {
  color: @error;
}
.up {
  color: @success;
}
.network-assets {
  &__token {
    height: 72px;
    padding: 0 20px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    border-radius: 10px;
    transition: background 300ms ease-in-out;
    text-decoration: none;
    margin: 0 12px;
    cursor: pointer;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    &-info {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      width: 190px;
      overflow: hidden;

      &.max {
        min-width: 190px;
        width: auto;
      }

      img {
        max-width: 32px;
        margin-right: 16px;
        border-radius: 100%;
        box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
      }

      &-name {
        h4 {
          font-style: normal;
          font-weight: 400;
          font-size: 16px;
          line-height: 24px;
          color: @primaryLabel;
          margin: 0 0 1px 0;
          white-space: nowrap;
          width: 132px;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        p {
          font-style: normal;
          font-weight: 400;
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0.5px;
          color: @secondaryLabel;
          margin: 0;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          flex-direction: row;
          white-space: nowrap;
          width: 132px;
          overflow: hidden;
          text-overflow: ellipsis;

          span {
            margin-left: 4px;
            text-transform: uppercase;
          }
        }

        &.max {
          h4,
          p {
            min-width: 132px;
            max-width: 100%;
            width: auto;
          }
        }
      }
    }

    &-sparkline {
      text-align: center;
      img {
        max-height: 32px;
        max-width: 32px;
      }
      p {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        font-style: normal;
        font-weight: 500;
        font-size: 10px;
        line-height: 14px;
        text-align: right;
        letter-spacing: 0.5px;
        margin: 0 0 2px 0;

        svg {
          margin-right: 2px;
        }
      }
    }

    &-price {
      text-align: right;
      width: 160px;

      h4 {
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        text-align: right;
        color: @primaryLabel;
        margin: 0 0 1px 0;
      }

      p {
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.5px;
        color: @secondaryLabel;
        margin: 0;
      }
    }
  }
}
</style>
