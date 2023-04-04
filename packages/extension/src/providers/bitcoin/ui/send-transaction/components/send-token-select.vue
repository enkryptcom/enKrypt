<template>
  <div class="send-token-select">
    <div class="send-token-select__image">
      <img :src="token.icon" />
    </div>
    <div class="send-token-select__info">
      <h5>{{ token.name }}</h5>
      <p>
        {{ balance ? $filters.formatFloatingPointValue(balance).value : "~" }}
        <span>{{ token.symbol }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { fromBase } from "@enkryptcom/utils";
import { BaseToken } from "@/types/base-token";

const props = defineProps({
  token: {
    type: Object as PropType<BaseToken>,
    default: () => {
      return {};
    },
  },
});

const balance = computed(() =>
  props.token && props.token.balance
    ? fromBase(props.token.balance, props.token.decimals!)
    : undefined
);
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-token-select {
  height: 64px;
  background: #ffffff;
  margin: 0 32px 8px 32px;
  box-sizing: border-box;
  border: 1px solid @gray02;
  box-sizing: border-box;
  border-radius: 10px;
  width: calc(~"100% - 64px");
  padding: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  position: relative;
  text-decoration: none;

  &__image {
    background: @buttonBg;
    box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.16);
    width: 32px;
    height: 32px;
    border-radius: 100%;
    overflow: hidden;
    margin-right: 12px;

    img {
      width: 100%;
      height: 100%;
    }
  }

  &__info {
    h5 {
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: @primaryLabel;
      width: 290px;
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
      width: 290px;

      span {
        font-variant: small-caps;
      }
    }
  }

  &__arrow {
    position: absolute;
    font-size: 0;
    padding: 4px;
    right: 8px;
    top: 16px;
  }
}
</style>
