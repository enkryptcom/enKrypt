<template>
  <div class="network-activity__total">
    <h3>
      {{ cryptoAmount }} <span>{{ symbol }}</span>
    </h3>
    <p>{{ $filters.currencyFormat(amount, "USD") }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "NetworkActivityTotal",
  props: {
    cryptoAmount: {
      type: Number,
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
    symbol: {
      type: String,
      default: "",
    },
  },
  computed: {},
});
</script>

<style lang="less">
@import "../../../styles/theme.less";

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
}
</style>
