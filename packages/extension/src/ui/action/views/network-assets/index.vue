<template>
  <div class="container">
    <custom-scrollbar class="network-assets__scroll-area" :settings="settings">
      <div v-if="!!selected" class="network-assets">
        <network-activity-total
          :crypto-amount="cryptoAmount"
          :fiat-amount="fiatAmount"
          :symbol="network.currencyName"
        />

        <network-activity-action
          :deposit-action="depositAction"
          :buy-action="buyAction"
          :send-action="sendAction"
          :swap-action="swapAction"
        />

        <network-assets-item
          v-for="(item, index) in assets"
          :key="index"
          :token="item"
        ></network-assets-item>
      </div>
    </custom-scrollbar>
  </div>
</template>

<script lang="ts">
export default {
  name: "NetworkAssets",
};
</script>

<script setup lang="ts">
import { useRoute } from "vue-router";
import NetworkActivityTotal from "../network-activity/components/network-activity-total.vue";
import NetworkActivityAction from "../network-activity/components/network-activity-action.vue";
import NetworkAssetsItem from "./components/network-assets-item.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import { onMounted, PropType, ref, toRef, watch } from "vue";
import { AssetsType } from "@/types/provider";
import { AccountsHeaderData } from "../../types/account";
import accountInfo from "@action/composables/account-info";
import { BaseNetwork } from "@/types/base-network";
const route = useRoute();
const props = defineProps({
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
  accountInfo: {
    type: Object as PropType<AccountsHeaderData>,
    default: () => ({}),
  },
});
const assets = ref<AssetsType[]>([]);

const { cryptoAmount, fiatAmount } = accountInfo(
  toRef(props, "network"),
  toRef(props, "accountInfo")
);
const selected: string = route.params.id as string;

const settings = {
  suppressScrollY: false,
  suppressScrollX: true,
  wheelPropagation: false,
};

const depositAction = () => {
  console.log("depositAction");
};
const buyAction = () => {
  console.log("buyAction");
};
const sendAction = () => {
  console.log("sendAction");
};
const swapAction = () => {
  console.log("swapAction");
};
const updateAssets = () => {
  props.network
    .getAllTokenInfo(props.accountInfo.selectedAccount?.address || "")
    .then((_assets) => (assets.value = _assets));
  // props.network
  // if (props.network.assetsHandler) {
  //   props.network
  //     .assetsHandler(
  //       props.network,
  //       props.accountInfo.selectedAccount?.address || ""
  //     )
  //     .then((_assets) => {
  //       assets.value = _assets;
  //     });
  // }
};
watch([props.network, props.accountInfo], updateAssets);
onMounted(() => {
  updateAssets();
});
</script>

<style lang="less" scoped>
@import "~@action/styles/theme.less";
@import "~@action/styles/custom-scroll.less";

.container {
  width: 100%;
  height: 488px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 56px 0;
  padding-top: 12px;
  box-sizing: border-box;
}

.network-assets {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  &__scroll-area {
    position: relative;
    margin: auto;
    width: 100%;
    max-height: 468px;
    margin: 0 0 8px 0;
    padding: 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }
}
</style>
