<template>
  <div class="send-alert">
    <alert-icon />
    <p>
      Not enough funds. You are<br />~{{
        $filters.formatFloatingPointValue(nativeValue).value
      }}
      {{ nativeSymbol }} (${{
        $filters.formatFiatValue(priceDifference).value
      }}) short.
    </p>
  </div>
</template>

<script setup lang="ts">
import AlertIcon from "@action/icons/send/alert-icon.vue";
import BigNumber from "bignumber.js";
import { computed } from "vue";

interface IProps {
  nativeSymbol: string;
  nativeValue: string;
  price?: string;
}

const props = defineProps<IProps>();

const priceDifference = computed(() => {
  return new BigNumber(props.nativeValue).times(props.price ?? "0").toFixed();
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.send-alert {
  margin: 0 32px 8px 32px;
  background: @error01;
  border-radius: 10px;
  padding: 12px 16px 12px 57px;
  position: relative;
  box-sizing: border-box;

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

    a {
      color: @error;

      &:hover {
        text-decoration: none;
      }
    }
  }
}
</style>
