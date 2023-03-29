<template>
  <div class="swap-initiated-amount">
    <img :src="token.logoURI" alt="" />

    <div class="swap-initiated-amount__info">
      <h4>
        {{ $filters.formatFloatingPointValue(tokenReadable).value }}
        <span>{{ token.symbol.toLowerCase() }}</span>
      </h4>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TokenType, SwapToken } from "@enkryptcom/swap";
import { PropType } from "vue";
import { toBN } from "web3-utils";

const props = defineProps({
  token: {
    type: Object as PropType<TokenType>,
    default: () => {
      return {};
    },
  },
  amount: {
    type: String,
    default: "0",
  },
});
const tokenReadable = new SwapToken(props.token).toReadable(toBN(props.amount));
</script>

<style lang="less">
@import "~@action/styles/theme.less";
.swap-initiated-amount {
  text-decoration: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  width: 100%;
  padding: 12px 16px;
  box-sizing: border-box;

  img {
    width: 32px;
    border-radius: 100%;
    margin-right: 12px;
    height: 32px;

    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
  }
  &__info {
    h4 {
      font-style: normal;
      font-weight: 500;
      font-size: 20px;
      line-height: 28px;
      color: @primaryLabel;
      margin: 0;
      word-break: break-all;

      span {
        font-variant: small-caps;
      }
    }
  }
}
</style>
