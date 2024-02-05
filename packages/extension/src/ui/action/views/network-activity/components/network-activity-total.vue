<template>
  <div v-if="cryptoAmount == '~'" class="network-activity__total">
    <balance-loader class="network-activity__loader-one" />
    <balance-loader class="network-activity__loader-two" />
  </div>
  <div v-else class="network-activity__total">
    <h3>
      {{ cryptoAmount }} <span>{{ symbol }}</span>
    </h3>
    <p>
      <span v-if="subnetwork !== ''">Chain {{ subnetwork }} &middot;</span>
      {{ fiatAmount }}
    </p>
  </div>
</template>

<script setup lang="ts">
import BalanceLoader from "@action/icons/common/balance-loader.vue";

defineProps({
  cryptoAmount: {
    type: String,
    default: "0",
  },
  fiatAmount: {
    type: String,
    default: "0",
  },
  symbol: {
    type: String,
    default: "",
  },
  subnetwork: {
    type: String,
    default: "",
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-activity {
  &__total {
    padding: 0 20px 12px 20px;

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
      font-size: 16px;
      line-height: 24px;
      color: @secondaryLabel;
      margin: 0;
    }
  }

  &__loader-one {
    width: 100px;
    height: 18px;
    margin-bottom: 13px;
    margin-top: 6px;
    display: block !important;
  }

  &__loader-two {
    width: 70px;
    height: 13px;
    display: block !important;
    margin-bottom: 6px;
  }
}
</style>
