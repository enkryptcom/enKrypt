<template>
  <div class="swap-best-offer-block">
    <h3>Best offer including network fee</h3>
    <div class="swap-best-offer-block__for">
      for<img :src="fromToken.logoURI" />
      <p>
        {{ $filters.formatFloatingPointValue(fromReadable).value }}
        <span>{{ props.fromToken.symbol }}</span>
      </p>
      you will get:
    </div>
    <div class="swap-best-offer-block__token">
      <img :src="toToken.logoURI" />
      <div class="swap-best-offer-block__token-info">
        <h4>
          {{ $filters.formatFloatingPointValue(toReadable).value }}
          <span>{{ toToken.symbol }}</span>
        </h4>
        <p>≈ {{ $filters.formatFiatValue(toTokenPrice).value }}</p>
      </div>
    </div>
    <!-- <best-offer-warning :fee-warning="true"></best-offer-warning>
    <best-offer-warning :token-warning="true"></best-offer-warning> -->
    <best-offer-error
      v-if="warning === SwapBestOfferWarnings.BAD_PRICE"
      :bad-trade="true"
    />
    <div v-if="trades.length > 1" class="swap-best-offer-block__offers">
      <a
        class="swap-best-offer-block__offers-link"
        :class="{ opened: isOffersOpen }"
        @click="toggleOffers"
        >{{ trades.length - 1 }} other offers <switch-arrow
      /></a>
      <best-offer-list
        v-show="isOffersOpen"
        :select="select"
        :to-token="toToken"
        :trades="trades"
        :picked-trade="pickedTrade"
      />
    </div>
    <div class="swap-best-offer-block__info">
      <p>
        Rate: 1 {{ fromToken.symbol.toUpperCase() }} ≈
        {{ $filters.formatFloatingPointValue(ratio).value }}
        {{ toToken.symbol.toUpperCase() }}
      </p>
      <p v-if="priceImpact">
        Price impact:
        {{ priceImpact }}%
      </p>
      <p v-if="pickedTrade.slippage">
        Max. slippage:
        {{ pickedTrade.slippage }}%
      </p>
      <p>
        Minimum received:
        {{ $filters.formatFloatingPointValue(toReadable).value }}
        {{ toToken.symbol.toUpperCase() }}
      </p>
      <p>
        Offer includes
        {{ pickedTrade.fee.toFixed(3) }}% Enkrypt fee
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import SwitchArrow from "@action/icons/header/switch_arrow.vue";
import BestOfferList from "./components/best-offer-list.vue";
import BestOfferError from "./components/best-offer-error.vue";
import BigNumber from "bignumber.js";
import { SwapBestOfferWarnings } from "@action/views/swap/types";
import {
  ProviderSwapResponse,
  TokenType,
  TokenTypeTo,
  SwapToken,
} from "@enkryptcom/swap";

interface SwapBestOfferProps {
  trades: ProviderSwapResponse[];
  pickedTrade: ProviderSwapResponse;
  fromToken: TokenType;
  toToken: TokenTypeTo;
  warning?: SwapBestOfferWarnings;
}

const props = defineProps<SwapBestOfferProps>();

const emit = defineEmits<{
  (e: "update:pickedTrade", trade: ProviderSwapResponse): void;
}>();

const isOffersOpen = ref(false);

const toTokenPrice = computed(() =>
  new SwapToken(props.toToken).getRawToFiat(props.pickedTrade.toTokenAmount)
);

const fromReadable = computed(() => {
  return new SwapToken(props.fromToken).getBalanceReadable();
});

const toReadable = computed(() => {
  return new SwapToken(props.toToken).toReadable(
    props.pickedTrade.toTokenAmount
  );
});

const priceImpact = computed(() => {
  if (!props.fromToken.price || !props.toToken.price) return null;
  else {
    const fromValue = new SwapToken(props.fromToken).getFiatTotal();
    const toValue = new SwapToken(props.toToken).getFiatTotal();
    const pI = BigNumber("1")
      .minus(BigNumber(fromValue).div(toValue))
      .toFixed(3);
    return pI;
  }
});

const ratio = computed(() => {
  const fromValue = new SwapToken(props.fromToken).getBalanceReadable();
  const toValue = new SwapToken(props.toToken).getBalanceReadable();
  return new BigNumber(toValue).div(new BigNumber(fromValue));
});

const select = (trade: ProviderSwapResponse) => {
  emit("update:pickedTrade", trade);
  toggleOffers();
};

const toggleOffers = () => {
  isOffersOpen.value = !isOffersOpen.value;
};
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";

.swap-best-offer-block {
  width: 100%;
  border: 1px solid rgba(95, 99, 104, 0.2);
  box-sizing: border-box;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 8px;

  h3 {
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 28px;
    letter-spacing: 0.15px;
    color: @primaryLabel;
    margin: 0 0 8px 0;
  }

  &__for {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 28px;
    letter-spacing: 0.15px;
    color: @primaryLabel;
    margin-bottom: 8px;

    img {
      width: 32px;
      height: 32px;
      margin: 0 8px;
    }

    p {
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      letter-spacing: 0.15px;
      color: @primaryLabel;
      margin: 0 8px 0 0;

      span {
        font-variant: small-caps;
      }
    }
  }

  &__token {
    width: 100%;
    height: 96px;
    background: @buttonBg;
    border-radius: 10px;
    margin: 0 0 8px 0px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    padding: 16px;
    box-sizing: border-box;

    img {
      width: 64px;
      height: 64px;
      margin-right: 16px;
    }

    &-info {
      h4 {
        font-style: normal;
        font-weight: 700;
        font-size: 24px;
        line-height: 32px;
        color: @primaryLabel;
        margin: 0 0 4px 0;

        span {
          font-variant: small-caps;
        }
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

  &__offers {
    display: block;
    position: relative;
    margin-bottom: 8px;
    font-size: 0;
    height: 40px;

    &-link {
      text-decoration: none;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      height: 40px;
      font-style: normal;
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0.5px;
      color: @primaryLabel;
      cursor: pointer;

      svg {
        -webkit-transition: all 300ms ease-in-out;
        -moz-transition: all 300ms ease-in-out;
        -ms-transition: all 300ms ease-in-out;
        -o-transition: all 300ms ease-in-out;
        transition: all 300ms ease-in-out;
      }

      &.opened {
        color: @secondaryLabel;

        svg {
          -moz-transform: rotate(180deg);
          -webkit-transform: rotate(180deg);
          -o-transform: rotate(180deg);
          -ms-transform: rotate(180deg);
          transform: rotate(180deg);
        }
      }
    }
  }

  &__info {
    p {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @secondaryLabel;
      margin: 0 0 2px 0;

      &:last-child {
        margin: 0;
      }
    }
  }
}
</style>
