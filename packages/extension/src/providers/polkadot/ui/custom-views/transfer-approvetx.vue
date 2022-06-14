<template>
  <h2>Transfer</h2>
  <h3>Token</h3>
  <div class="provider-verify-transaction__block">
    <div class="provider-verify-transaction__info">
      <img :src="props.token.icon" />
      <div class="provider-verify-transaction__info-info">
        <h4>{{ props.token.symbol }}</h4>
        <p>
          {{ props.amount }}
        </p>
      </div>
    </div>
  </div>
  <h3>To</h3>
  <div class="provider-verify-transaction__block">
    <div class="provider-verify-transaction__info">
      <img :src="createIcon(props.to)" />
      <div class="provider-verify-transaction__info-info">
        <h4>
          {{
            `${props.to.slice(0, 5)}...${props.to.slice(props.to.length - 5)}`
          }}
        </h4>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseToken } from "@/types/base-token";
import createIcon from "../../libs/blockies";
// import { TransferProps } from "./types"

interface IProps {
  to: string;
  token: BaseToken;
  amount: string;
}
const props = defineProps<IProps>();
</script>

<style lang="less">
@import "~@action/styles/theme.less";
@import "~@action/styles/provider-verify-transaction.less";
</style>
