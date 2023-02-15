<template>
  <div class="network-menu">
    <router-link
      v-if="network"
      :to="{ name: 'assets', params: { id: !!selected ? selected : null } }"
    >
      <Assets /><br />Assets
    </router-link>
    <router-link
      :to="{
        name: 'activity',
        params: { id: !!selected ? selected : null },
      }"
    >
      <Activity /><br />Activity
    </router-link>
    <router-link
      v-if="(network as EvmNetwork).NFTHandler"
      :to="{ name: 'nfts', params: { id: !!selected ? selected : null } }"
    >
      <NFTs /><br />NFTs
    </router-link>
    <router-link
      v-if="DappList[network.name]"
      :to="{
        name: 'dapps',
        params: { id: !!selected ? selected : null },
      }"
    >
      <DApps /><br />DApps
    </router-link>
  </div>
</template>

<script setup lang="ts">
import Activity from "@action/icons/tabs/activity.vue";
import Assets from "@action/icons/tabs/assets.vue";
import NFTs from "@action/icons/tabs/nfts.vue";
import DApps from "@action/icons/tabs/dapps.vue";
import { PropType } from "vue";
import DappList from "@/libs/dapp-list";
import { BaseNetwork } from "@/types/base-network";
import { EvmNetwork } from "@/providers/ethereum/types/evm-network";

defineProps({
  selected: {
    type: String,
    default: "",
  },
  network: {
    type: Object as PropType<BaseNetwork>,
    default: () => ({}),
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-menu {
  position: absolute;
  width: 460px;
  height: 56px;
  left: 340px;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: row;

  a {
    display: block;
    text-align: center;
    text-decoration: none;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    letter-spacing: 0.5px;
    color: @primaryLabel;
    opacity: 0.38;
    transition: opacity 300ms ease-in-out;

    svg {
      margin-bottom: 1px;
    }

    &:hover {
      opacity: 0.6;
    }
  }

  .router-link-active {
    opacity: 1 !important;
  }
}
</style>
