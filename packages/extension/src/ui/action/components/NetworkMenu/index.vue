<template>
  <div class="network-menu">
    <router-link
      :to="{ name: 'assets', params: { id: !!selected ? selected.id : null } }"
    >
      <Assets /><br />Assets
    </router-link>
    <router-link
      :to="{
        name: 'activity',
        params: { id: !!selected ? selected.id : null },
      }"
    >
      <Activity /><br />Activity
    </router-link>
    <router-link
      :to="{ name: 'nfts', params: { id: !!selected ? selected.id : null } }"
    >
      <NFTs /><br />NFTs
    </router-link>
    <router-link
      :to="{ name: 'dapps', params: { id: !!selected ? selected.id : null } }"
    >
      <DApps /><br />DApps
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { NetworkItem } from "@action/types/network";
import Activity from "@action/icons/tabs/activity.vue";
import Assets from "@action/icons/tabs/assets.vue";
import NFTs from "@action/icons/tabs/nfts.vue";
import DApps from "@action/icons/tabs/dapps.vue";

export default defineComponent({
  name: "NetworkMenu",
  components: {
    Activity,
    Assets,
    NFTs,
    DApps,
  },
  props: {
    selected: {
      type: Object as PropType<NetworkItem>,
      default: () => {
        return {};
      },
    },
  },
});
</script>

<style lang="less">
@import "~@action/styles/theme.less";

.network-menu {
  position: fixed;
  width: 460px;
  height: 56px;
  left: 340px;
  bottom: 0;
  background: @white;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: row;
  z-index: 1;

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

    svg {
      margin-bottom: 1px;
    }
  }

  .router-link-active {
    opacity: 1;
  }
}
</style>
