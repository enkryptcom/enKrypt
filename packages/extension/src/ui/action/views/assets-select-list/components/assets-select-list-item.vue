<template>
  <a class="assets-select-list__token" @click="select">
    <div class="assets-select-list__token-info">
      <img :src="token.icon" />

      <div class="assets-select-list__token-info-name">
        <h4>{{ token.name }}</h4>
        <p>
          {{ balance ? $filters.formatFloatingPointValue(balance).value : "~" }}
          <span>{{ token.symbol }}</span>
        </p>
      </div>
    </div>

    <div class="assets-select-list__token-price">
      <h4>${{ price ? $filters.formatFiatValue(price).value : "~" }}</h4>
    </div>
  </a>
</template>

<script setup lang="ts">
import { fromBase } from "@enkryptcom/utils";
import { BaseToken } from "@/types/base-token";
import BigNumber from "bignumber.js";
import { computed, PropType } from "vue";

const emit = defineEmits<{
  (e: "update:selectAsset", asset: BaseToken): void;
}>();

const props = defineProps({
  token: {
    type: Object as PropType<BaseToken>,
    default: () => ({}),
  },
});

const balance = computed(() =>
  props.token.balance
    ? fromBase(props.token.balance, props.token.decimals)
    : undefined
);

const price = computed(() =>
  balance.value
    ? new BigNumber(balance.value).times(props.token.price ?? 0).toFixed()
    : undefined
);

const select = () => {
  emit("update:selectAsset", props.token);
};
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.assets-select-list {
  &__token {
    height: 64px;
    margin: 0 8px;
    padding: 0 8px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    cursor: pointer;
    border-radius: 10px;
    transition: background 300ms ease-in-out;

    &:hover {
      background: @black007;
    }

    &-info {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row;

      img {
        width: 32px;
        height: 32px;
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

    &-price {
      text-align: right;

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
