<template>
  <div class="network-nfts__total">
    <p>NFTs Net Worth</p>
    <h3>{{ $filters.formatFiatValue(amount).value }} USD</h3>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkNftsTotal",
};
</script>

<script setup lang="ts">
defineProps({
  amount: {
    type: String,
    default: "0",
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-nfts {
  &__total {
    padding: 0 0 22px 0;

    h3 {
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
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0.25px;
      color: @secondaryLabel;
      margin: 0;
    }
  }
}
</style>
