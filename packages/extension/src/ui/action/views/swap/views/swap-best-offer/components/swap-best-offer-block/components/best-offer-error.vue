<template>
  <div class="best-offer-error" :class="{ 'top-inset': notEnoughtETH }">
    <alert-icon />
    <p v-if="badTrade">
      Warning: this is an extremely bad trade. Due to low liquidity, you will
      get a rate that is significantly lower than the market. We highly
      recommend you reconsider.
    </p>

    <p v-if="notEnoughtETH" class="with-link">
      Not enough {{ nativeSymbol }} to pay the network<br />fee. You are ~{{
        $filters.formatFloatingPointValue(nativeValue).value
      }}
      {{ nativeSymbol }} (${{ $filters.formatFiatValue(price).value }}) short.
    </p>

    <p v-if="notEnoughtVerify" class="with-link">
      Not enough funds. You are<br />~{{
        $filters.formatFloatingPointValue(nativeValue).value
      }}
      {{ nativeSymbol }} (${{ $filters.formatFiatValue(price).value }}) short.
    </p>

    <p v-if="belowDeposit">
      Warning: This swap will cause you to go below the existential deposit and
      will lead to lost funds.
    </p>

    <!-- <a
      v-if="notEnoughtETH || notEnoughtVerify"
      href="#"
      class="best-offer-error__buy-eth"
    >
      Buy ETH
    </a> -->
  </div>
</template>

<script setup lang="ts">
import AlertIcon from "@action/icons/send/alert-icon.vue";
defineProps({
  badTrade: {
    type: Boolean,
    default: false,
  },
  notEnoughtETH: {
    type: Boolean,
    default: false,
  },
  notEnoughtVerify: {
    type: Boolean,
    default: false,
  },
  belowDeposit: {
    type: Boolean,
    default: false,
  },
  nativeSymbol: {
    type: String,
    default: () => "",
  },
  nativeValue: {
    type: String,
    default: () => "",
  },
  price: {
    type: String,
    default: () => "",
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";
.best-offer-error {
  margin: 0 0 8px 0;
  background: @error01;
  border-radius: 10px;
  padding: 12px 16px 12px 57px;
  position: relative;
  box-sizing: border-box;
  &.top-inset {
    margin: 8px 0 8px 0;
  }
  &__buy-eth {
    width: 67px;
    height: 24px;
    position: absolute;
    right: 16px;
    top: 50%;
    margin-top: -12px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 6px;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 24px;
    letter-spacing: 0.8px;
    color: @primaryLabel;
    text-decoration: none;
    text-align: center;
  }
  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    margin-top: -12px;
  }
  p {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    color: @error;
    margin: 0;

    &.with-link {
      padding-right: 68px;
    }
    a {
      color: @error;
      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
