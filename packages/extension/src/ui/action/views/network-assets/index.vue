<template>
  <div class="container">
    <custom-scrollbar
      class="network-assets__scroll-area"
      :settings="scrollSettings({ suppressScrollX: true })"
    >
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

    <network-assets-loading v-if="isLoading"></network-assets-loading>
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
import NetworkAssetsLoading from "./components/network-assets-loading.vue";
import CustomScrollbar from "@action/components/custom-scrollbar/index.vue";
import { onMounted, PropType, ref, toRef, watch } from "vue";
import { AssetsType } from "@/types/provider";
import { AccountsHeaderData } from "../../types/account";
import accountInfo from "@action/composables/account-info";
import { BaseNetwork } from "@/types/base-network";
import scrollSettings from "@/libs/utils/scroll-settings";

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
const isLoading = ref(false);

const { cryptoAmount, fiatAmount } = accountInfo(
  toRef(props, "network"),
  toRef(props, "accountInfo")
);
const selected: string = route.params.id as string;

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
  isLoading.value = true;
  props.network
    .getAllTokenInfo(props.accountInfo.selectedAccount?.address || "")
<<<<<<< HEAD
    .then((_assets) => (assets.value = _assets));
=======
    .then((_assets) => {
      assets.value = _assets;
      isLoading.value = true;
    });
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
>>>>>>> ui/fix-0.5.0
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
  height: 600px;
  background-color: @white;
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.16);
  margin: 0;
  padding-top: 0;
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
    max-height: 600px;
    margin: 0;
    padding: 68px 0 0 0 !important;
    box-sizing: border-box;

    &.ps--active-y {
      padding-right: 0;
    }
  }
}
</style>

<style lang="less">
.network-assets__scroll-area {
  .ps__rail-y {
    right: 3px !important;
    margin: 59px 0 !important;
  }
}
</style>
