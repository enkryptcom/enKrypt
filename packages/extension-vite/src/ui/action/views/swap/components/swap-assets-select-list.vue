<template>
  <assets-select-list
    v-bind="$attrs"
    :assets="BaseTokenAssets"
    @update:select-asset="selectToken"
  />
</template>

<script setup lang="ts">
import AssetsSelectList from "@action/views/assets-select-list/index.vue";
import { computed, PropType } from "vue";
import { BaseToken } from "@/types/base-token";
import { sortByRank, TokenType, TokenTypeTo } from "@enkryptcom/swap";
import { Erc20Token } from "@/providers/ethereum/types/erc20-token";
import { NATIVE_TOKEN_ADDRESS } from "@/providers/ethereum/libs/common";

const emit = defineEmits<{
  (e: "update:selectAsset", asset: TokenType | TokenTypeTo): void;
}>();

const props = defineProps({
  assets: {
    type: Array as PropType<(TokenType | TokenTypeTo)[]>,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});
const TokenTypeMap: Record<
  string,
  { baseToken: BaseToken; TokenType: TokenType | TokenTypeTo }
> = {};
const BaseTokenAssets = computed(() => {
  const basetokens: BaseToken[] = [];
  const assets = [...props.assets].sort(sortByRank);
  assets.forEach((asset) => {
    TokenTypeMap[asset.address || NATIVE_TOKEN_ADDRESS] = {
      baseToken: new Erc20Token({
        decimals: asset.decimals,
        contract: asset.address || NATIVE_TOKEN_ADDRESS,
        icon: asset.logoURI,
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price?.toString(),
        balance: asset.balance ? asset.balance.toString() : "0",
      }),
      TokenType: asset,
    };
    basetokens.push(
      TokenTypeMap[asset.address || NATIVE_TOKEN_ADDRESS].baseToken
    );
  });
  return basetokens;
});
const selectToken = (token: BaseToken) => {
  emit(
    "update:selectAsset",
    TokenTypeMap[(token as Erc20Token).contract].TokenType
  );
};
</script>
