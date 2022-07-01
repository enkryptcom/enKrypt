<template>
  <a class="send-token-item" @click="select">
    <div class="send-token-item__info">
      <img :src="token.icon" />

      <div class="send-token-item__info-name">
        <h4>{{ token.name }}</h4>
        <p>
          {{
            tokenBalance
              ? $filters.formatFloatingPointValue(tokenBalance).value
              : "~"
          }}
          <span>{{ token.symbol }}</span>
        </p>
      </div>
    </div>

    <div class="send-token-item__price">
      <h4>{{ $filters.formatFiatValue(tokenBalance).value }}</h4>
      <p>@{{ $filters.formatFiatValue(tokenPrice).value }}</p>
    </div>
  </a>
</template>

<script lang="ts">
export default {
  name: "NetworkAssetsItem",
};
</script>

<script setup lang="ts">
import { onBeforeMount, onUpdated, ref } from "vue";
import { BaseToken } from "@/types/base-token";
import EvmAPI from "@/providers/ethereum/libs/api";
import { ApiPromise } from "@polkadot/api";
import { fromBase } from "@/libs/utils/units";

interface IProps {
  token: BaseToken;
  selectToken: (token: BaseToken) => void;
  activeAccount?: string;
  api?: EvmAPI | ApiPromise;
}

const props = defineProps<IProps>();

const tokenPrice = ref<number | undefined>();
const tokenBalance = ref<string | undefined>();

const init = async () => {
  if (props.api && props.activeAccount) {
    props.token
      .getUserBalance(props.api, props.activeAccount)
      .then((balance) => {
        tokenBalance.value = fromBase(balance, props.token.decimals);
      });
    props.token.getTokenPrice().then((fiatValue) => {
      console.log(fiatValue);
    });
  }
};

onBeforeMount(() => init());

onUpdated(() => init());

const select = () => {
  props.selectToken(props.token);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-token-item {
  display: block;
  text-decoration: none;
  cursor: pointer;
  height: 64px;
  position: relative;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;

  &__info {
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

  &__price {
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
</style>
