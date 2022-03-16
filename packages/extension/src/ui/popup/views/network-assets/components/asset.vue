<template>
  <div class="network-assets__token">
    <div class="network-assets__token-info">
      <img :src="token.icon" />

      <div class="network-assets__token-info-name">
        <h4>{{ token.name }}</h4>
        <p>
          {{ token.amount }} <span>{{ token.symbol }}</span>
        </p>
      </div>
    </div>

    <div class="network-assets__token-sparkline">
      <p><Up />10.20%</p>
      <img src="../../../assets/sparkline.png" />
    </div>

    <div class="network-assets__token-price">
      <h4>{{ $filters.currencyFormat(amount, "USD") }}</h4>
      <p>@{{ $filters.currencyFormat(token.price, "USD") }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Token } from "../../../types/token";
import Up from "../../../icons/asset/sparkline-up.vue";

export default defineComponent({
  name: "NetworkAssetsToken",
  components: {
    Up,
  },
  props: {
    token: {
      type: Object as PropType<Token>,
      default: () => ({}),
    },
  },
  setup(props) {
    let amount = 0;

    if (props.token) {
      amount = props.token.price * props.token.amount;
    }

    return {
      amount,
    };
  },
});
</script>

<style lang="less">
@import "../../../styles/theme.less";

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

    &-info {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;
      width: 190px;

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

          span {
            font-variant: small-caps;
            margin-left: 4px;
          }
        }
      }
    }

    &-sparkline {
      text-align: center;

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
        color: @primary;
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
